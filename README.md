# 🏔️ ProjectHimaloy

A democratic, interest-free cooperative fund management system for groups and communities.

![ProjectHimaloy](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Express](https://img.shields.io/badge/Express.js-4.0-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [User Roles](#-user-roles)
- [Core Functionality](#-core-functionality)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**ProjectHimaloy** is a full‑stack web application that helps groups manage their cooperative funds in a transparent, democratic way. Members contribute monthly deposits, apply for interest‑free loans, vote on loan requests, and track their financial activity – all within a secure, role‑based system.

### Why ProjectHimaloy?

- 💰 **Interest‑Free Model** – No interest on loans, extra installments become personal savings.
- 🗳️ **Democratic Voting** – Every member votes on loan requests.
- 🔒 **Secure** – Manager actions require a 6‑digit PIN.
- 📧 **Email Notifications** – Automatic emails for important events.
- 📊 **Complete Transparency** – Full transaction history visible to all members.

---

## ✨ Features

### 👤 Member Features
- 📊 **Dashboard** – Total deposits, last deposit, current month status, active loan.
- 💰 **Monthly Deposits** – Submit deposits with payment method, transaction ID, and notes.
- 💸 **Loan Management** – Apply for loans (5/10 months), view active loans, make installments.
- 🗳️ **Voting** – Cast votes on loan requests, view voting progress.
- 📋 **Transaction History** – Complete record of all deposits, loans, and installments.
- 👤 **Profile** – Manage personal information and profile image.

### 👔 Manager Features
- 📊 **Manager Dashboard** – Overview of collections, pending confirmations, and active loans.
- 💰 **Deposit Approval** – Review and confirm/reject member deposits with PIN verification.
- 💸 **Loan Management** – Start voting, track active loans, and view loan details.
- 🗳️ **Voting Management** – Create general votings, view results, and call meetings.
- 📅 **Meetings** – Schedule meetings (quick, monthly, loan‑related).
- 💳 **Installment Approval** – Confirm/reject loan installment payments.
- 👤 **Manager Profile** – Set/change manager action PIN.

### 🔧 Admin Features
- 👥 **Member Management** – View all members, block/unblock, assign/remove manager role.
- 📜 **Transaction History** – View all transactions across the entire fund.
- 🔄 **Manager Overview** – Current manager details and past manager cycles.
- ⚙️ **System Settings** – Configure deposit amounts, loan rules, voting thresholds.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, Hero UI |
| **Backend** | Express.js, Node.js |
| **Database** | MongoDB (Native Driver) |
| **Authentication** | Better Auth (Email/Password + Google OAuth) |
| **Email** | Nodemailer (Gmail SMTP) |
| **Scheduling** | node‑cron (automated reminders) |
| **Deployment** | Vercel (Frontend), Vercel/Render (Backend) |

---

## 📁 Project Structure
