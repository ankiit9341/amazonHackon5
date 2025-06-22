from openai import OpenAI

client = OpenAI(
    api_key="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",  # Replace with your real Groq key
    base_url="https://api.groq.com/openai/v1"
)

response = client.chat.completions.create(
    model="llama3-8b-8192",
    messages=[
        {"role": "user", "content": "What is PowerCard?"}
    ]
)

print(response.choices[0].message.content)
