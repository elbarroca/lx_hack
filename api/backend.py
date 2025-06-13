import os
import sys
import json
from pathlib import Path

# Add the backend directory to the Python path - improved for Vercel
current_dir = Path(__file__).parent
backend_path = current_dir.parent / "backend"
sys.path.insert(0, str(backend_path))

def handler(event, context):
    """
    Optimized Vercel handler for FastAPI backend
    """
    try:
        # Try to import and use Mangum
        from mangum import Mangum
        from main import app
        
        # Create optimized Mangum handler for Vercel
        mangum_handler = Mangum(
            app, 
            lifespan="off",
            api_gateway_base_path=None,
            text_mime_types=[
                "application/json",
                "application/javascript", 
                "application/xml",
                "application/vnd.api+json",
            ]
        )
        
        return mangum_handler(event, context)
        
    except ImportError as e:
        # Mangum not available
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            "body": json.dumps({
                "error": "Mangum dependency missing",
                "message": f"Import error: {str(e)}",
                "status": "dependency_error",
                "suggestion": "Ensure mangum is in requirements.txt"
            })
        }
        
    except Exception as e:
        # Other errors (app import, etc.)
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", 
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            "body": json.dumps({
                "error": "Backend initialization failed",
                "message": str(e),
                "status": "initialization_error",
                "backend_path": str(backend_path),
                "sys_path": sys.path[:3]  # First 3 entries for debugging
            })
        }