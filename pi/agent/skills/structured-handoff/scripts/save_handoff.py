#!/usr/bin/env python3
"""
Save a handoff report to .pi/handoff/ directory.

Usage:
  python save_handoff.py "task-name" < handoff.md
  
Or with a file:
  python save_handoff.py "jwt-token-refresh" handoff.md
"""

import sys
import os
from pathlib import Path
from datetime import datetime

def save_handoff(task_name, content):
    """Save handoff to .pi/handoff/[task-name]-[timestamp].md"""
    
    # Create .pi/handoff if it doesn't exist
    handoff_dir = Path.cwd() / ".pi" / "handoff"
    handoff_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate filename with timestamp: YYYY-MM-DD_HH-MM-SS
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"{task_name}-{timestamp}.md"
    filepath = handoff_dir / filename
    
    # Save file
    with open(filepath, "w") as f:
        f.write(content)
    
    print(f"✓ Handoff saved: {filepath}")
    return str(filepath)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python save_handoff.py <task-name> [file]")
        sys.exit(1)
    
    task_name = sys.argv[1]
    
    # Read content from file or stdin
    if len(sys.argv) > 2:
        filepath = sys.argv[2]
        with open(filepath, "r") as f:
            content = f.read()
    else:
        content = sys.stdin.read()
    
    save_handoff(task_name, content)
