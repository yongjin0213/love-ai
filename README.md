# Love Data
Love Data is an AI-powered text analzyer that takes in text messages and helps users understand relationship dynamics through conversation patterns. This tool will output a Love Score, a 0-100 score that reflects compatabilty, and feedback on what went well and what went poorly during the conversation. 

## Project overview

### What It Does
Love Bot analyzes text message conversations to identify:

- Communication patterns - Message lengths, unique language, and engagement levels
- Sentiment analysis - Emotional tone and enthusiasm in messages
- Interaction metrics - Question asking and conversation initiation
- Interest indicators - Signs of engagement, effort, and reciprocity

The bot generates a percentage score representing estimated interest based on various conversational signals.


### How It Works

- Upload Messages - Users can upload text message exports or paste conversations
- AI Analysis - The bot processes messages using natural language processing
- Pattern Detection - Identifies key indicators of interest and engagement
- Score Generation - Produces an interest percentage with detailed breakdown
- Insights Report - Provides actionable feedback about the conversation dynamics

## Installation/setup instructions
We used Vercel to deploy our website. [Link to Deployment](https://arrows-liart.vercel.app/)
## Tech stack

Programming languages: **Java Script**

Frameworks and libraries: **Next.js and Claude API**

API: **Claude API**

Databases: **None**

Deployment Platform: **Vercel**

## Challenges & solutions

We had a difficult time connecting our frontend to backend. To combat this we had a meeting between our backend and frontend developers to confirm where the .json files would be exchanged between the frontend and backend. We learned a lot about communication specifically making sure the product vision is aligned between both ends to make sure they meet accurately in the middle. Next time we want to plan out more ahead and have more occasional meetings to check in on each others.

## Future plans

If we had more time, we would've developed our own RAG model to have a better algorithm for deciding the romantic interest value. Similarly, we would've used federated learning to ensure our users privacy while continuing to train the model to become stronger and more accurate.

## Contributers
- **Yongjin Lee** - Backend
- **Kathy Lim** - Frontend
- **Aiden Joo** - Backend
- **Mark Sheen** - PM and Design

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
