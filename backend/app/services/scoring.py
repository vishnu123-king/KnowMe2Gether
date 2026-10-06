import re
from typing import List

def normalize_text(text: str) -> str:
    if not text:
        return ""
    # Lowercase
    normalized = text.lower()
    # Remove basic punctuation
    normalized = re.sub(r'[.,/#!$%^&*;:{}=\-_`~()?"\']', '', normalized)
    # Collapse multiple whitespaces
    normalized = re.sub(r'\s+', ' ', normalized)
    return normalized.strip()

def check_answer_match(
    question_type: str,
    correct_answer: str,
    accepted_answers: List[str],
    responder_answer: str
) -> bool:
    if question_type == "text":
        norm_resp = normalize_text(responder_answer)
        norm_expected = normalize_text(correct_answer)
        if norm_resp == norm_expected:
            return True
        for accepted in accepted_answers:
            if norm_resp == normalize_text(accepted):
                return True
        return False

    # multiple_choice or yes_no
    return responder_answer.strip().lower() == correct_answer.strip().lower()

def get_score_category(percentage: int) -> dict:
    if percentage >= 90:
        return {
            "title": "BEST FRIENDS FOREVER",
            "emoji": "❤️🔥",
            "description": "You two are practically soulmates! There is nothing you hide from each other!",
            "color": "#e11d48",
        }
    if percentage >= 75:
        return {
            "title": "SUPER CLOSE FRIENDS",
            "emoji": "❤️",
            "description": "Incredible bond! They know your favorites, quirks, and stories inside out!",
            "color": "#db2777",
        }
    if percentage >= 50:
        return {
            "title": "GOOD FRIENDS",
            "emoji": "😊",
            "description": "Solid friendship! You share great memories and understand each other well.",
            "color": "#d97706",
        }
    if percentage >= 25:
        return {
            "title": "FRIENDSHIP LOADING...",
            "emoji": "😂",
            "description": "Time to hang out more, grab some snacks, and share a few more secrets!",
            "color": "#4f46e5",
        }
    return {
        "title": "DO YOU EVEN KNOW ME?",
        "emoji": "😂",
        "description": "Uh oh! Are you sure you two have ever had a conversation before?! Time for a catch-up!",
        "color": "#64748b",
    }
