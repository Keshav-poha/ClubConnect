import sys
import json
import datetime
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

# Categories that qualify as student-interest events.
VALID_CATEGORIES = (
    "hackathon, workshop, seminar, recruitment drive, audition, competition, "
    "coding contest, book launch, magazine release, open mic, guest lecture, "
    "webinar, info session, orientation, tryout, fest registration, "
    "club recruitment, internship drive"
)

# Patterns that should NEVER be classified as events.
REJECT_PATTERNS = (
    "festival greeting, holiday wish, team announcement, president reveal, "
    "VP appointment, election result, throwback post, recap, RIP/condolence, "
    "birthday wish, congratulations post, meme, quote of the day"
)


def extract_event(caption: str) -> str:
    """Run the local Qwen 0.5B model to classify and extract event data."""
    model_name = "Qwen/Qwen2.5-0.5B-Instruct"

    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype="auto",
        device_map="cpu"
    )

    today = datetime.date.today().isoformat()

    prompt = f"""You are a strict event classifier for a college club aggregator app.

TASK: Analyze the Instagram caption below. Determine if it is an ACTIONABLE UPCOMING EVENT that a student would want to attend or participate in.

VALID event types (set is_event=true): {VALID_CATEGORIES}
INVALID post types (set is_event=false): {REJECT_PATTERNS}

RULES:
- is_event must be TRUE only for posts that explicitly invite students to do something on a specific or upcoming date.
- is_event must be FALSE for greetings, wishes, announcements about people, past event recaps, memes, or generic club promotions.
- If unsure, default to is_event=false.
- Today's date is {today}. If a date is mentioned but already passed, set is_event=false.

Output ONLY valid JSON, nothing else.
Format: {{"is_event": bool, "title": "string", "date": "YYYY-MM-DD or empty", "location": "string or empty"}}

Caption: {caption}

JSON:"""

    messages = [
        {"role": "system", "content": "You are a JSON event extractor. Output only valid JSON."},
        {"role": "user", "content": prompt}
    ]
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )
    model_inputs = tokenizer([text], return_tensors="pt")

    generated_ids = model.generate(
        **model_inputs,
        max_new_tokens=200,
        do_sample=False
    )
    generated_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
    ]

    response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]

    # Extract the first valid JSON object from the response.
    try:
        start = response.find('{')
        end = response.rfind('}') + 1
        if start != -1 and end > start:
            parsed = json.loads(response[start:end])
            # Normalize: ensure required keys exist.
            return json.dumps({
                "is_event": bool(parsed.get("is_event", False)),
                "title": str(parsed.get("title", "")),
                "date": str(parsed.get("date", "")),
                "location": str(parsed.get("location", ""))
            })
        return json.dumps({"is_event": False, "title": "", "date": "", "location": ""})
    except (json.JSONDecodeError, ValueError):
        return json.dumps({"is_event": False, "title": "", "date": "", "location": ""})


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"is_event": False, "title": "", "date": "", "location": ""}))
    else:
        print(extract_event(sys.argv[1]))
