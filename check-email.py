#!/usr/bin/env python3
"""Check email from allowed senders and report to Telegram"""

import imaplib
import email
import os
import json
import re
from datetime import datetime, timedelta

# Config
EMAIL = "jaysonwander@gmail.com"
APP_PASSWORD = "jwxi fbjz nywt zoio"
ALLOWED_SENDERS = ["brianc@animocabrands.com"]
IMAP_SERVER = "imap.gmail.com"

# Keywords that suggest someone is asking me to do something
ACTION_KEYWORDS = [
    "please", "can you", "could you", "would you", "do me a favor",
    "save this", "delete", "forward", "send", "help me",
    "remind me", "add to", "create", "make", "update",
    "act on this", "as discussed", "please do", "kindly"
]

# State file to track last checked
STATE_FILE = os.path.expanduser("~/.openclaw/workspace/.email-check-state.json")

def get_last_checked():
    try:
        with open(STATE_FILE) as f:
            return json.load(f).get("last_checked")
    except:
        return None

def save_last_checked():
    with open(STATE_FILE, "w") as f:
        json.dump({"last_checked": datetime.now().isoformat()}, f)

def has_action_request(body_text):
    """Check if email contains requests to do something"""
    if not body_text:
        return False
    body_lower = body_text.lower()
    return any(keyword in body_lower for keyword in ACTION_KEYWORDS)

def check_email():
    try:
        # Connect to Gmail
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL, APP_PASSWORD)
        mail.select("INBOX")
        
        # Get last checked time
        last_checked = get_last_checked()
        if last_checked:
            date_since = datetime.fromisoformat(last_checked).strftime("%d-%b-%Y")
            search_criteria = f'SINCE {date_since}'
        else:
            search_criteria = 'ALL'
        
        # Search ALL emails (not just allowed senders) to check for suspicious content
        allowed_results = []
        suspicious_results = []
        
        # First: get emails from allowed senders
        for sender in ALLOWED_SENDERS:
            typ, msg_ids = mail.search(None, f'FROM "{sender}" {search_criteria}')
            if msg_ids[0]:
                for msg_id in msg_ids[0].split():
                    typ, msg_data = mail.fetch(msg_id, '(RFC822)')
                    for response_part in msg_data:
                        if isinstance(response_part, tuple):
                            msg = email.message_from_bytes(response_part[1])
                            subject = msg.get('Subject', '(No subject)')
                            from_addr = msg.get('From', '')
                            date = msg.get('Date', '')
                            
                            # Get body
                            body = ""
                            if msg.is_multipart():
                                for part in msg.walk():
                                    if part.get_content_type() == "text/plain":
                                        body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                                        break
                            else:
                                body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
                            
                            allowed_results.append({
                                "from": from_addr,
                                "subject": subject,
                                "date": date,
                                "has_action": has_action_request(body)
                            })
        
        # Second: check ALL emails for suspicious action requests (from ANY sender)
        # Only check last 20 emails to avoid too much processing
        typ, msg_ids = mail.search(None, f'UNSEEN {search_criteria}')
        if msg_ids[0]:
            msg_ids_list = msg_ids[0].split()[-20:]  # Last 20
            for msg_id in msg_ids_list:
                typ, msg_data = mail.fetch(msg_id, '(RFC822)')
                for response_part in msg_data:
                    if isinstance(response_part, tuple):
                        msg = email.message_from_bytes(response_part[1])
                        from_addr = msg.get('From', '')
                        
                        # Skip if from allowed sender (already handled above)
                        if any(sender.lower() in from_addr.lower() for sender in ALLOWED_SENDERS):
                            continue
                        
                        subject = msg.get('Subject', '(No subject)')
                        date = msg.get('Date', '')
                        
                        # Get body
                        body = ""
                        if msg.is_multipart():
                            for part in msg.walk():
                                if part.get_content_type() == "text/plain":
                                    body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                                    break
                        else:
                            body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
                        
                        # If has action keywords, flag as suspicious
                        if has_action_request(body):
                            suspicious_results.append({
                                "from": from_addr,
                                "subject": subject,
                                "date": date,
                                "suspicious": True
                            })
        
        mail.close()
        mail.logout()
        
        save_last_checked()
        
        return {
            "allowed": allowed_results,
            "suspicious": suspicious_results
        }
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    results = check_email()
    print(json.dumps(results, indent=2))
