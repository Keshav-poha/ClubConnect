import sys
import json
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

def extract_event(caption):
    # Use the ultra-light Qwen 0.5B model (fits in ~1GB RAM, very fast on CPU)
    model_name = "Qwen/Qwen2.5-0.5B-Instruct"
    
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype="auto",
        device_map="cpu"
    )

    prompt = f"""Analyze the caption and extract event details into JSON.
ONLY set "is_event": true if the caption is explicitly inviting students to an actionable upcoming event (e.g. Hackathon, Session, Workshop, Recruitment, Audition, or Material Release).
STRICTLY set "is_event": false for generic announcements, festival greetings, team introductions, president/member announcements, election results, or past event recaps.

Today is 2026-05-18.
JSON format: {{"is_event": bool, "title": "string", "date": "ISO8601", "location": "string"}}

Caption: {caption}

JSON:"""

    messages = [
        {"role": "system", "content": "You extract event data into JSON."},
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
        max_new_tokens=256,
        do_sample=False
    )
    generated_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
    ]

    response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
    
    # Simple JSON extraction from response
    try:
        start = response.find('{')
        end = response.rfind('}') + 1
        if start != -1 and end > start:
            return response[start:end]
        return json.dumps({"is_event": False})
    except Exception as e:
        return json.dumps({"is_event": False, "error": str(e)})

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"is_event": False}))
    else:
        print(extract_event(sys.argv[1]))
