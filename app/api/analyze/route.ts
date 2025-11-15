// This is a mock API route for frontend testing

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        // Get the uploaded image from FormData
        const formData = await request.formData()
        const image = formData.get('image') as File

        if (!image) {
            return NextResponse.json(
                { error: 'No image provided' },
                { status: 400 }
            )
        }

        // Validate file type
        if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif'].includes(image.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Please upload a PNG, JPG, or GIF image.' },
                { status: 400 }
            )
        }

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Generate a random score between 50-95 for demo purposes
        const score = Math.floor(Math.random() * 45) + 50

        // Create different assessment messages based on score
        let overallAssessment = ''

        if (score >= 80) {
            overallAssessment = "The conversation shows strong indicators of romantic interest. The person demonstrates consistent engagement, uses emotionally expressive language, and responds with enthusiasm. They appear to prioritize your conversations and show genuine curiosity about you. The linguistic patterns suggest they're invested in building a deeper connection."
        } else if (score >= 70) {
            overallAssessment = "There are positive signs of romantic interest in this conversation. The person shows good engagement and uses warm, friendly language. While not overtly romantic, the patterns suggest they enjoy talking with you and value your connection. Their responses indicate interest, though they may be taking things slowly or being cautious."
        } else if (score >= 50) {
            overallAssessment = "The conversation shows mixed signals. While there's friendly engagement, the romantic interest indicators are moderate. They respond but may not always initiate or show deep emotional investment. This could mean they're interested but uncertain, prefer taking things very slow, or see you primarily as a friend but are open to more."
        } else {
            overallAssessment = "Based on the conversation patterns, romantic interest appears limited. The responses are friendly but show characteristics more typical of platonic relationships. The language lacks romantic undertones, emotional depth is moderate, and engagement patterns suggest casual friendship rather than romantic pursuit. However, remember that some people express interest differently or may be very reserved."
        }

        // Return the analysis result
        return NextResponse.json({
            score: score,
            overallAssessment: overallAssessment,
        })

    } catch (error) {
        console.error('Analysis error:', error)
        return NextResponse.json(
            { error: 'Failed to analyze conversation. Please try again.' },
            { status: 500 }
        )
    }
}