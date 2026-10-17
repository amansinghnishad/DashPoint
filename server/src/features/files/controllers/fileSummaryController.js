const File = require('../../../models/File');
const Collection = require('../../../models/Collection');
const PlannerWidget = require('../../../models/PlannerWidget');
const fs = require('fs').promises;
const axios = require('axios');
const { attachEmbeddingToPlannerWidget } = require('../../../services/embeddingsService');
const { summarizePdfBuffer, buildSummaryNoteTitle } = require('../../../services/documentSummarizationService');

const summarizeFileToCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const fileId = String(req.params?.id || '').trim();
    const collectionId = String(req.body?.collectionId || '').trim();
    const noteTitleInput = String(req.body?.noteTitle || '').trim();

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File id is required'
      });
    }

    if (!collectionId) {
      return res.status(400).json({
        success: false,
        message: 'collectionId is required'
      });
    }

    const file = await File.findOne({ _id: fileId, userId });
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const isPdf =
      String(file?.mimetype || '').toLowerCase() === 'application/pdf' ||
      String(file?.originalName || '').toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are supported for summarization'
      });
    }

    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    let pdfBuffer = null;
    if (file.path) {
      try {
        pdfBuffer = await fs.readFile(file.path);
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'Stored file path is unavailable'
        });
      }
    } else if (file.url) {
      try {
        const downloadResponse = await axios.get(file.url, {
          responseType: 'arraybuffer',
          timeout: 60000
        });
        pdfBuffer = Buffer.from(downloadResponse.data);
      } catch (error) {
        return res.status(502).json({
          success: false,
          message: 'Failed to download file content for summarization'
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        message: 'File has no accessible content URL or path'
      });
    }

    const summaryResult = await summarizePdfBuffer({
      buffer: pdfBuffer,
      filename: file.originalName || file.filename
    });

    const noteTitle = buildSummaryNoteTitle({
      filename: file.originalName || file.filename,
      customTitle: noteTitleInput
    });

    const noteBody = [
      `Source file: ${String(file.originalName || file.filename || 'PDF').trim()}`,
      summaryResult.pageCount ? `Pages: ${summaryResult.pageCount}` : null,
      summaryResult.wasTruncated
        ? 'Note: Source text was truncated before summarization.'
        : null,
      '',
      summaryResult.summaryText || summaryResult.summaryMarkdown
    ]
      .filter(Boolean)
      .join('\n');

    const widget = new PlannerWidget({
      userId,
      widgetType: 'notes',
      title: noteTitle,
      data: {
        text: noteBody
      }
    });

    await attachEmbeddingToPlannerWidget(widget);
    await widget.save();
    await collection.addItem('planner', String(widget._id));

    return res.status(201).json({
      success: true,
      message: 'File summarized and saved as note',
      data: {
        widget,
        file: {
          _id: String(file._id),
          originalName: file.originalName
        },
        collection: {
          _id: String(collection._id),
          name: collection.name
        },
        summaryMeta: {
          model: summaryResult.model,
          pageCount: summaryResult.pageCount,
          sourceCharacters: summaryResult.sourceCharacters,
          wasTruncated: summaryResult.wasTruncated
        }
      }
    });
  } catch (error) {
    console.error('Error summarizing file to collection:', error);
    res.status(error?.statusCode || 500).json({
      success: false,
      message: error?.message || 'Failed to summarize file'
    });
  }
};

module.exports = {
  summarizeFileToCollection
};
