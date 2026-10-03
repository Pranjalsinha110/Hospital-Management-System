<div align="center">

# 🏥 Hospital Management System

### 🚀 Smart • Secure • Scalable • AI-Powered Healthcare Platform

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=3000&pause=1000&color=00C9FF&center=true&vCenter=true&width=700&lines=Modern+Hospital+Management+System;AI-Powered+Medical+Assistant;Doctor+%7C+Patient+%7C+Admin+Portal;Appointments+%7C+Medical+Records+%7C+Payments;Built+with+React+%2B+Node.js+%2B+MongoDB+%2B+Python" alt="Typing SVG" />

<br/>

![Hospital Management System](https://img.shields.io/badge/Hospital-Management%20System-00C9FF?style=for-the-badge\&logo=hospital\&logoColor=white)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge\&logo=node.js\&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge\&logo=mongodb\&logoColor=white)
![Python](https://img.shields.io/badge/Python-AI-3776AB?style=for-the-badge\&logo=python\&logoColor=white)

<br/>

> 🩺 **A complete digital healthcare ecosystem designed to simplify hospital operations, improve patient experience, and bring AI-powered medical assistance into one platform.**

</div>

---

## 🌟 Overview

**Hospital Management System** is a modern full-stack healthcare management platform designed to digitize and simplify hospital operations.

The system provides dedicated functionality for:

* 👨‍⚕️ Doctors
* 🧑‍🤝‍🧑 Patients
* 🛡️ Administrators
* 📅 Appointments
* 📋 Medical Records
* 💊 Prescriptions
* 💳 Online Payments
* 🤖 AI Medical Assistant

The platform combines a modern **React frontend**, scalable **Node.js/Express backend**, **MongoDB database**, and a **Python + LangGraph + Groq AI layer**.

---

# ✨ Key Features

## 👤 Patient Management

Patients can:

* 📝 Create and manage their profile
* 👤 Update personal information
* 📅 Book appointments
* 🔎 View available doctors
* 📋 View medical history
* 💊 View prescriptions
* 🧾 View medical records
* 💳 Make online payments
* 🤖 Ask health-related questions to the AI assistant

---

## 👨‍⚕️ Doctor Management

Doctors can:

* 👤 Manage professional profiles
* 📅 Manage appointments
* 🧑‍🤝‍🧑 View assigned patients
* 📋 Access patient medical information
* 💊 Create prescriptions
* 📝 Maintain medical records
* 📊 Manage their availability

---

## 🛡️ Admin Dashboard

Administrators can manage the entire hospital ecosystem.

### Admin capabilities include:

* 👥 User management
* 👨‍⚕️ Doctor management
* 🧑‍🤝‍🧑 Patient management
* 📅 Appointment management
* 🏥 Hospital departments
* 📊 Dashboard statistics
* 💳 Payment-related information
* 🔐 Role-based access control

---

# 🤖 AI Medical Assistant

One of the core features of this project is the integrated **AI Medical Assistant**.

The AI is designed specifically for healthcare and hospital-related questions.

### Example

```text
User:
Tell me about fever.

AI:
Provides general educational information about fever,
common symptoms, possible causes, precautions,
and when professional medical attention may be appropriate.
```

### 🧠 AI Stack

```text
Python
   ↓
GenAI workflow
   ↓
AgenticAI workfloe
   ↓
Groq
   ↓
LLM
```

### 🔒 Domain Restriction

The AI is designed to focus on:

* 🩺 Medical conditions
* 🤒 Symptoms
* 💊 General medicine information
* 🧪 Medical tests
* 🏥 Hospital services
* 👨‍⚕️ Doctors and departments
* 📅 Appointments
* ❤️ General health information

For unrelated questions, the assistant responds with a healthcare-domain restriction message.

> ⚠️ **Medical Disclaimer:**
> The AI assistant provides general educational information and is not a replacement for a qualified healthcare professional. Users should consult an appropriate medical professional for diagnosis and treatment.

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────────┐
                    │        React App        │
                    │       Frontend          │
                    │                         │
                    │  Patient / Doctor/Admin │
                    └────────────┬────────────┘
                                 │
                                 │ REST API
                                 ▼
                    ┌─────────────────────────┐
                    │     Node.js + Express   │
                    │        Backend          │
                    │                         │
                    │ Auth │ Users │ Doctors  │
                    │ Appointments │ Payments │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │   MongoDB    │ │   Razorpay   │ │  Python AI   │
        │   Database   │ │   Payments   │ │   Service    │
        └──────────────┘ └──────────────┘ └──────┬───────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │   GenAI      |
                                          |   Workflow   │
                                          └──────┬───────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │     Groq     │
                                          │     LLM      │
                                          └──────────────┘
```

---

# 🛠️ Technology Stack

## 🎨 Frontend

| Technology           | Purpose             |
| -------------------- | ------------------- |
| ⚛️ React.js          | Frontend UI         |
| 🧭 React Router      | Client-side routing |
| 🎨 CSS3              | Responsive styling  |
| 🔗 Axios             | API communication   |
| 💳 Razorpay Checkout | Payment integration |

---

## ⚙️ Backend

| Technology    | Purpose            |
| ------------- | ------------------ |
| 🟢 Node.js    | Runtime            |
| 🚂 Express.js | REST API           |
| 🔐 JWT        | Authentication     |
| 🔒 bcrypt     | Password hashing   |
| 🗄️ MongoDB    | Database           |
| 🧩 Mongoose   | MongoDB ODM        |
| 💳 Razorpay   | Payment processing |

---

## 🤖 AI Layer

| Technology       | Purpose                   |
| ---------------- | ------------------------- |
| 🐍 Python        | AI service                |
| 🧠 GenAi         | AI workflow               |
| 🔗 AgenticAI     | LLM framework             |
| ⚡ Groq          | LLM inference             |
| 📦 Pydantic      | Data validation           |
| 🔐 python-dotenv | Environment configuration |

---

# 📂 Project Structure

```text
Hospital Management System/
│
├── Backend/
│   │
│   ├── ai/
│   │   ├── chat_node.py
│   │   ├── graph.py
│   │   ├── llm.py
│   │   ├── state.py
│   │   └── requirements.txt
│   │
│   ├── scripts/
│   │   └── createAdmin.js
│   │
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   │
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   │
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

---

# 🔐 Authentication & Security

The application uses role-based authentication.

### Supported roles

```text
ADMIN
  │
  ├── Manage Users
  ├── Manage Doctors
  ├── Manage Patients
  └── Manage Hospital Operations

DOCTOR
  │
  ├── Manage Appointments
  ├── View Patients
  ├── Prescriptions
  └── Medical Records

PATIENT
  │
  ├── Book Appointments
  ├── View Doctors
  ├── Medical History
  ├── Payments
  └── AI Assistant
```

Security practices include:

* 🔐 JWT-based authentication
* 🔒 Password hashing
* 🛡️ Protected routes
* 👥 Role-based authorization
* 🔑 Environment-based secrets
* 🚫 Sensitive credentials excluded from Git
* 🌐 CORS configuration

---

# 📅 Appointment Management

The appointment module allows patients and doctors to manage healthcare appointments digitally.

### Appointment flow

```text
Patient
   │
   ▼
Select Doctor
   │
   ▼
Select Date & Time
   │
   ▼
Book Appointment
   │
   ▼
Payment (if applicable)
   │
   ▼
Appointment Confirmation
   │
   ▼
Doctor Dashboard
```

---

# 💳 Payment Integration

The system integrates **Razorpay** for online payments.

The frontend loads the Razorpay checkout script and communicates with the backend for payment processing.

### Payment flow

```text
Patient
   │
   ▼
Choose Appointment
   │
   ▼
Create Payment Order
   │
   ▼
Razorpay Checkout
   │
   ▼
Payment
   │
   ▼
Backend Verification
   │
   ▼
Appointment Confirmation
```

---

# 🗄️ Database

The project uses **MongoDB** as its primary database.

The backend communicates with MongoDB using **Mongoose**.

Typical entities include:

```text
Users
Doctors
Patients
Appointments
Medical Records
Prescriptions
Payments
Departments
```

---

# 🚀 Local Installation

## 1️⃣ Clone the repository

```bash
git clone https://github.com/Pranjalsinha110/Hospital-Management-System.git
```

```bash
cd Hospital-Management-System
```

---

## 2️⃣ Install Backend Dependencies

```bash
cd Backend
npm install
```

---

## 3️⃣ Install Python AI Dependencies

```bash
cd ai
pip install -r requirements.txt
```

Then return to Backend:

```bash
cd ..
```

---

## 4️⃣ Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

# 🔑 Environment Variables

Create the required environment files locally.

### Backend

```text
Backend/.env
```

Example structure:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### AI

```text
Backend/ai/.env
```

Example:

```env
GROQ_API_KEY=your_groq_api_key
```

> ⚠️ Never commit `.env` files or API keys to GitHub.

---

# ▶️ Running the Application

## Start Backend

```bash
cd Backend
node server.js
```

Backend will run on your configured port.

---

## Start Frontend

Open another terminal:

```bash
cd frontend
npm start
```

The React development server will start locally.

---

# 🧪 AI Assistant Test

Once the application is running, open the AI assistant and try:

```text
Tell me about fever
```

Other examples:

```text
What are common symptoms of diabetes?
```

```text
What is a blood test?
```

```text
What is the purpose of an ECG?
```

```text
How can I book a doctor appointment?
```

---

# ☁️ Deployment

The project is designed for cloud deployment.

### Frontend

```text
React
   ↓
Vercel
```

### Backend

```text
Node.js + Express
   ↓
Render
```

### Database

```text
MongoDB Atlas
```

### AI

```text
Python
   ↓
Agentic Workflow
   ↓
Groq
```

---

# 🌐 Production Architecture

```text
                 INTERNET
                     │
                     ▼
            ┌─────────────────┐
            │     Vercel      │
            │ React Frontend  │
            └────────┬────────┘
                     │
                     │ HTTPS API
                     ▼
            ┌─────────────────┐
            │     Render      │
            │ Node + Express  │
            └──────┬─────┬────┘
                   │     │
          ┌────────┘     └─────────┐
          ▼                        ▼
   ┌──────────────┐         ┌──────────────┐
   │ MongoDB Atlas │        │ Python AI    │
   │   Database   │         │              │
   └──────────────┘         └──────┬───────┘
                                    │
                                    ▼
                               ┌─────────┐
                               │  Groq   │
                               │   LLM   │
                               └─────────┘
```

---

# 📸 Screenshots

> Add your application screenshots here to showcase the UI.

### 🏠 Home Page

```text
Add screenshot here
```

### 👤 Patient Dashboard

```text
Add screenshot here
```

### 👨‍⚕️ Doctor Dashboard

```text
Add screenshot here
```

### 🛡️ Admin Dashboard

```text
Add screenshot here
```

### 🤖 AI Medical Assistant

```text
Add screenshot here
```

---

# 🎯 Project Goals

The primary goals of this project are:

* 🏥 Digitize hospital operations
* 📉 Reduce manual administrative work
* 📅 Simplify appointment management
* 👨‍⚕️ Improve doctor-patient interaction
* 📋 Centralize medical records
* 💳 Enable digital payments
* 🤖 Provide AI-powered healthcare assistance
* 🔐 Maintain secure role-based access
* 📱 Provide a responsive modern user experience

---

# 🔮 Future Improvements

Planned or possible future enhancements include:

* 📱 Dedicated mobile application
* 🔔 Real-time notifications
* 📧 Email notifications
* 📲 SMS notifications
* 📹 Online doctor consultation
* 📊 Advanced analytics
* 🧠 Improved AI medical workflows
* 🏥 Multi-hospital support
* 🧾 Digital invoices
* 📈 Advanced hospital reporting
* 🔍 Advanced medical search
* 🌍 Multi-language support

---

# ⚠️ Medical Disclaimer

This application and its AI assistant are intended for **educational and informational purposes**.

The AI assistant:

* Does not replace a doctor.
* Does not provide definitive diagnoses.
* Should not be used for emergency medical decisions.
* Should not be used to independently start, stop, or change prescription medication.

For serious or emergency symptoms, users should seek appropriate professional medical care immediately.

---

# 🤝 Contributing

Contributions are welcome.

### Contribution workflow

```bash
# Fork the repository

# Create a branch
git checkout -b feature/your-feature

# Make your changes

# Commit
git commit -m "Add your feature"

# Push
git push origin feature/your-feature

# Open a Pull Request
```

Please keep contributions clean, documented, and focused.

---

# 📜 License

This project is currently available for educational and development purposes.

Add an appropriate open-source license if you plan to distribute the project publicly.

---

# 👨‍💻 Author

<div align="center">

## Pranjal Sinha

### Full-Stack/GenAI/AgenticAI Developer • AI Enthusiast • Healthcare Technology

Built with ❤️ using:

**React • Node.js • Express • MongoDB • Python • LangGraph • Groq**

<br/>

⭐ If you find this project interesting, consider giving the repository a star!

</div>

---

<div align="center">

### 🏥 Hospital Management System

**Making Healthcare Management Smarter, Simpler & More Connected.**

<br/>

![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square\&logo=react\&logoColor=black)
![Made with Node](https://img.shields.io/badge/Made%20with-Node.js-339933?style=flat-square\&logo=node.js\&logoColor=white)
![Powered by MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square\&logo=mongodb\&logoColor=white)
![AI Powered](https://img.shields.io/badge/AI-LangGraph%20%2B%20Groq-FF6B35?style=flat-square)

</div>
