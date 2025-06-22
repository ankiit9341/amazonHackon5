from openai import OpenAI
from dotenv import load_dotenv
import os

# Load all variables from .env
load_dotenv()

# Access environment variables
groq_api_key = os.getenv("GROQ_API_KEY")
mongo_uri = os.getenv("MONGO_URI")
google_api_key = os.getenv("GOOGLE_API_KEY")

# Print to verify (optional - remove in production)
# print(mongo_uri, google_api_key)

# Initialize OpenAI client with Groq
client = OpenAI(
    api_key=groq_api_key,
    base_url="https://api.groq.com/openai/v1"
)

# Use the Groq-hosted model
response = client.chat.completions.create(
    model="llama3-8b-8192",
    messages=[
        {"role": "user", "content": "What is PowerCard?"}
    ]
)

print(response.choices[0].message.content)
