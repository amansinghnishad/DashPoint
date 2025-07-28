#!/usr/bin/env python3
"""
Test script for the conversational agent system
"""
import requests
import json
import sys

# Configuration
AGENT_URL = "http://localhost:8000"
SERVER_URL = "http://localhost:5000"  # Adjust if your server runs on different port

def test_agent_direct():
    """Test the agent directly"""
    print("🤖 Testing Agent Direct Connection...")
    
    try:
        # Test health
        health_response = requests.get(f"{AGENT_URL}/health", timeout=5)
        print(f"✅ Agent Health: {health_response.json()}")
        
        # Test capabilities
        cap_response = requests.get(f"{AGENT_URL}/capabilities", timeout=5)
        capabilities = cap_response.json()
        print(f"✅ Agent Capabilities: {capabilities.get('supported_actions', [])}")
        
        # Test conversational command
        test_commands = [
            'add note "This is a test note"',
            'add todo "Test task"',
            'weather for New York'
        ]
        
        for command in test_commands:
            response = requests.post(f"{AGENT_URL}/conversational", 
                json={
                    "command": command,
                    "context": {"userId": "test-user"}
                }, 
                timeout=10
            )
            result = response.json()
            print(f"✅ Command '{command}': {result.get('message', 'No message')}")
            if result.get('api_call'):
                print(f"   📡 Would call: {result['api_call']['method']} {result['api_call']['endpoint']}")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to agent. Make sure it's running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Agent test failed: {e}")
        return False

def test_server_conversational():
    """Test the server's conversational endpoint (requires authentication)"""
    print("\n🌐 Testing Server Conversational Endpoint...")
    
    try:
        # Note: This would require authentication in a real scenario
        # For now, just test if the endpoint exists
        response = requests.get(f"{SERVER_URL}/api/conversational/capabilities", timeout=5)
        if response.status_code == 401:
            print("✅ Server conversational endpoint exists (requires auth)")
            return True
        elif response.status_code == 200:
            print("✅ Server conversational endpoint accessible")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"⚠️  Unexpected response: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on http://localhost:5000")
        return False
    except Exception as e:
        print(f"❌ Server test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 DashPoint Conversational System Test\n")
    
    agent_ok = test_agent_direct()
    server_ok = test_server_conversational()
    
    print(f"\n📊 Test Results:")
    print(f"   Agent: {'✅ PASS' if agent_ok else '❌ FAIL'}")
    print(f"   Server: {'✅ PASS' if server_ok else '❌ FAIL'}")
    
    if agent_ok and server_ok:
        print("\n🎉 Conversational system is ready!")
        print("\nExample commands you can try:")
        print('   - add note "Buy groceries"')
        print('   - add todo "Finish project"')
        print('   - summarize https://youtube.com/watch?v=dQw4w9WgXcQ')
        print('   - weather for London')
        print('   - explain artificial intelligence')
    else:
        print("\n🔧 Please fix the failing components before using the system.")
        sys.exit(1)

if __name__ == "__main__":
    main()
