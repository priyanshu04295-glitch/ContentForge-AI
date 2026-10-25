# ContentForge AI 🚀

### An Intelligent Generative AI Platform for Automated Multi-Format Content Transformation

ContentForge AI is an AI-powered platform that transforms source content into multiple formats using generative AI. Users can provide text or upload supported documents, configure generation settings, select an AI provider, and generate content tailored to their requirements.

The project aims to simplify content repurposing by converting a single source into multiple useful formats through one platform.

## ✨ Key Features

* **Multi-Format Content Generation:** Transform source content into different output formats.
* **Multiple AI Providers:** Choose between Google Gemini, Groq, and OpenRouter.
* **Document Upload:** Upload supported documents and extract their text for processing.
* **Custom Generation Settings:** Configure language, audience, tone, length, detail level, formatting, and source adherence.
* **Multiple Output Formats:** Generate summaries, articles, social media posts, advisories, presentations, and FAQs.
* **Content Regeneration:** Regenerate content for a selected output format.
* **User Authentication:** Register and log in to access the platform.
* **Generation History:** Access previously generated content.
* **Interactive Web Interface:** Use a modern frontend to configure and generate content.
* **Future Model Integration:** A dedicated option for the planned ContentForge-AI model is marked as coming soon.

## 🧠 Supported Output Formats

| Format            | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| Summary           | Condenses source content into its key points.                   |
| Executive Summary | Presents the main findings and important information concisely. |
| Article           | Converts source material into a structured article.             |
| LinkedIn Post     | Creates professional social media content.                      |
| Advisory          | Produces a structured advisory based on the source material.    |
| Presentation      | Organizes information into presentation-ready content.          |
| FAQ               | Generates frequently asked questions and answers.               |

## ⚙️ Generation Settings

Users can customize content generation using settings such as:

* **AI Provider:** Google Gemini, Groq, or OpenRouter.
* **Language:** Select the language for generated content.
* **Audience:** Specify the intended readers.
* **Tone:** Control the writing style.
* **Length:** Choose the desired content length.
* **Detail Level:** Control the amount of information included.
* **Formatting:** Select the structure of the output.
* **Source Adherence:** Control how closely the output follows the supplied source.
* **Custom Instructions:** Provide additional generation requirements.

## 🛠️ Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Python
* FastAPI
* Uvicorn

### AI Integration

* Google Gemini API
* Groq API
* OpenRouter API

### Database and Authentication

* SQLite
* JWT-based authentication

### Document Processing

* PyPDF for PDF processing
* python-docx for DOCX processing

*Technology and library details should be verified against the project's current dependency files.*

## 🏗️ Project Architecture

```text
ContentForge-AI/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── auth.py
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

The frontend provides the user interface and sends requests to the backend. The FastAPI backend validates requests, processes source content, communicates with the selected AI provider, and returns the generated output. SQLite is used for local data storage.

## 🚀 Getting Started

Follow these instructions to run the project locally.

### Prerequisites

Install the following:

* Python
* Node.js and npm
* Git

You will also need an API key for at least one configured AI provider.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ContentForge-AI.git
cd ContentForge-AI
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Set Up the Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` directory and configure the required variables.

Example template:

```env
AI_PROVIDER=groq

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=your_groq_model

OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=your_openrouter_model

AUTH_SECRET_KEY=replace_with_a_secure_random_secret
```

Use model identifiers supported by the corresponding provider and your application's implementation. Confirm the exact required environment variable names in the backend code before running the application.

**Security:** Replace the example values with your own credentials. Never commit your `.env` file or expose API keys and authentication secrets publicly.

Start the backend server:

```bash
python -m uvicorn main:app --reload
```

The backend should be available at:

* API: `http://127.0.0.1:8000`
* Interactive API documentation: `http://127.0.0.1:8000/docs`

### 3. Set Up the Frontend

Open a second terminal and navigate to the frontend directory from the project root:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the application in your browser:

`http://localhost:3000`

### 4. Verify the Application

1. Start both the backend and frontend.
2. Open the frontend in your browser.
3. Register or log in.
4. Enter source content or upload a supported document.
5. Select an output format.
6. Choose an available AI provider.
7. Configure the generation settings.
8. Generate content and review the result.

## 🔐 Security Considerations

* Store API keys and authentication secrets in environment variables.
* Keep `.env` files out of version control.
* Use a strong, randomly generated authentication secret.
* Do not commit virtual environments, dependency folders, or local database files.
* Validate uploaded files and incoming API requests.
* Apply appropriate authentication and authorization checks to protected endpoints.
* Configure production CORS settings before deployment.

## 🗺️ Future Enhancements

Planned improvements may include:

* **ContentForge-AI Model:** Integrate a dedicated model for content transformation.
* Additional source document formats.
* More output formats and customization options.
* Improved output quality and consistency.
* Enhanced content editing and export capabilities.
* Production deployment and scalability improvements.
* More comprehensive automated testing.

The ContentForge-AI model is a planned enhancement and is not represented as an already implemented model.

## 🎯 Project Objective

The objective of ContentForge AI is to make content transformation faster and more accessible by allowing users to reuse source material across different formats. The platform combines configurable generative AI, document processing, and a web-based interface to streamline content creation.

## 👨‍💻 Contributing

Contributions, bug reports, and feature suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Submit a pull request describing your improvements.

## 📄 License

A license has not yet been specified. Add a `LICENSE` file before distributing the project under an open-source license.

---

**ContentForge AI**
*Transform one source into multiple formats.*
