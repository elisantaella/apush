/**
 * APUSH Exam PDF Parser
 * 
 * This script extracts multiple-choice questions from APUSH exam PDFs and converts them
 * to a structured format for use in the APUSH Final Mastery application.
 * 
 * Requirements:
 * - Node.js
 * - pdf-parse (npm install pdf-parse)
 * - fs (built-in)
 * - path (built-in)
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Configuration
const EXAMS_DIR = './exams';
const OUTPUT_FILE = './exam_data.js';

// Time periods for categorizing questions
const TIME_PERIODS = [
    { id: 1, name: "Period 1: 1491-1607", keywords: ["native", "american", "columbus", "settlement", "spanish", "1491", "1607"] }
,
/**
 * Handle image-based stimuli extraction (more complex)
 * This is a placeholder function that would need to be expanded for real-world use
 * PDF images require specialized tools beyond the scope of this example
 */
function extractImageStimulus(pdfData, examYear) {
    // This would require a more specialized PDF processing library
    // that can extract images and their positions in the document
    console.log('Image extraction requires additional libraries');
    return [];
},

/**
 * Main entry point
 */
processAllExams().catch(err => {
    console.error('Fatal error:', err);
}),

    { id: 2, name: "Period 2: 1607-1754", keywords: ["colony", "colonial", "new england", "jamestown", "massachusetts", "puritan", "1607", "1754"] },
    { id: 3, name: "Period 3: 1754-1800", keywords: ["revolution", "jefferson", "washington", "adams", "constitution", "continental", "1754", "1800"] },
    { id: 4, name: "Period 4: 1800-1848", keywords: ["jackson", "manifest destiny", "monroe", "1800", "1848", "expansion", "market revolution"] },
    { id: 5, name: "Period 5: 1844-1877", keywords: ["civil war", "slavery", "lincoln", "reconstruction", "abolition", "secession", "1844", "1877"] },
    { id: 6, name: "Period 6: 1865-1898", keywords: ["industry", "immigration", "gilded age", "social darwinism", "1865", "1898", "indigenous", "native american"] },
    { id: 7, name: "Period 7: 1890-1945", keywords: ["progressive", "world war i", "great depression", "roosevelt", "wilson", "new deal", "1890", "1945"] },
    { id: 8, name: "Period 8: 1945-1980", keywords: ["cold war", "civil rights", "vietnam", "kennedy", "nixon", "1945", "1980", "feminism"] },
    { id: 9, name: "Period 9: 1980-Present", keywords: ["reagan", "clinton", "bush", "obama", "1980", "terrorism", "globalization", "conservative"]}
];

/**
 * Main function that processes all exam PDFs and generates the output file
 */
async function processAllExams() {
    console.log('APUSH Exam PDF Parser');
    console.log('=====================');
    
    // Check if exams directory exists
    if (!fs.existsSync(EXAMS_DIR)) {
        console.error(`Error: ${EXAMS_DIR} directory not found. Please create it and add exam PDFs.`);
        return;
    }
    
    // Get list of PDF files
    const files = fs.readdirSync(EXAMS_DIR)
        .filter(file => file.toLowerCase().endsWith('.pdf'));
    
    if (files.length === 0) {
        console.error(`Error: No PDF files found in ${EXAMS_DIR} directory.`);
        return;
    }
    
    console.log(`Found ${files.length} exam PDFs to process.`);
    
    // Process each file
    const allExamData = [];
    
    for (const file of files) {
        const filePath = path.join(EXAMS_DIR, file);
        console.log(`Processing: ${file}`);
        
        try {
            // Extract year from filename (assuming format like "2018.pdf")
            const examYear = parseInt(path.basename(file, '.pdf'), 10);
            
            if (isNaN(examYear)) {
                console.warn(`  Warning: Could not determine exam year from filename: ${file}`);
                continue;
            }
            
            // Parse PDF and extract questions
            const examData = await processExamPDF(filePath, examYear);
            
            if (examData.length === 0) {
                console.warn(`  Warning: No questions extracted from ${file}`);
            } else {
                console.log(`  Successfully extracted ${examData.length} question sets`);
                allExamData.push(...examData);
            }
        } catch (error) {
            console.error(`  Error processing ${file}: ${error.message}`);
        }
    }
    
    // Write the data to a JavaScript file
    if (allExamData.length > 0) {
        const jsContent = `// APUSH Exam Data - Generated on ${new Date().toLocaleString()}
// Contains ${allExamData.length} stimulus-question sets from ${files.length} exam PDFs

const examData = ${JSON.stringify(allExamData, null, 2)};

// Save exam data to localStorage
localStorage.setItem('examData', JSON.stringify(examData));
`;
        
        fs.writeFileSync(OUTPUT_FILE, jsContent);
        console.log(`Successfully wrote ${allExamData.length} question sets to ${OUTPUT_FILE}`);
    } else {
        console.error('No questions were extracted. Output file not created.');
    }
}

/**
 * Process a single exam PDF file and extract question data
 * @param {string} filePath - Path to the PDF file
 * @param {number} examYear - Year of the exam
 * @returns {Array} - Array of extracted question data
 */
async function processExamPDF(filePath, examYear) {
    // Read and parse the PDF file
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    
    // Extract all MCQ sections (stimulus + questions)
    const mcqSets = extractMCQSets(pdfData.text, examYear);
    
    return mcqSets;
}

/**
 * Extract multiple-choice question sets (stimulus + questions) from PDF text
 * @param {string} pdfText - Full text content of the PDF
 * @param {number} examYear - Year of the exam
 * @returns {Array} - Array of question set objects
 */
function extractMCQSets(pdfText, examYear) {
    const mcqSets = [];
    
    // Regex patterns to identify sections
    const sectionRegex = /Questions (\d+)(?:-(\d+))(?: are based on the following [\w\s]+:|[.:])([\s\S]+?)(?=Questions \d+(?:-\d+)|$)/g;
    const questionRegex = /(\d+)\.\s*([\s\S]+?)(?=(?:\([A-D]\))|$)/;
    const optionsRegex = /\(([A-D])\)\s*([\s\S]+?)(?=\([A-D]\)|(?:\d+\.)|$)/g;
    
    // Find all sections with a stimulus followed by questions
    let sectionMatch;
    while ((sectionMatch = sectionRegex.exec(pdfText)) !== null) {
        // Extract section information
        const startQuestion = parseInt(sectionMatch[1], 10);
        const endQuestion = sectionMatch[2] ? parseInt(sectionMatch[2], 10) : startQuestion;
        const sectionContent = sectionMatch[3].trim();
        
        // Split section into stimulus and questions
        const stimulusEndIndex = sectionContent.indexOf(`${startQuestion}.`);
        if (stimulusEndIndex === -1) continue; // Skip if we can't find the first question
        
        // Extract stimulus text
        const stimulusText = sectionContent.substring(0, stimulusEndIndex).trim();
        
        // Skip if stimulus is too short (likely not a valid stimulus)
        if (stimulusText.length < 20) continue;
        
        // Extract questions part
        const questionsText = sectionContent.substring(stimulusEndIndex);
        
        // Find the time period based on content
        const timePeriod = identifyTimePeriod(stimulusText);
        
        // Create a new question set
        const questionSet = {
            examYear,
            period: timePeriod,
            stimulusType: 'text', // Assume text for now, we'll handle images later
            stimulus: cleanText(stimulusText),
            questions: []
        };
        
        // Extract individual questions with their options
        for (let qNum = startQuestion; qNum <= endQuestion; qNum++) {
            const questionPattern = new RegExp(`${qNum}\\.\\s*([\\s\\S]+?)(?=(?:\\d+\\.)|$)`, 'g');
            const questionMatch = questionPattern.exec(questionsText);
            
            if (questionMatch) {
                const fullQuestionText = questionMatch[1].trim();
                
                // Split the question text from options
                const questionTextMatch = fullQuestionText.match(questionRegex);
                if (!questionTextMatch) continue;
                
                const questionText = cleanText(questionTextMatch[2]);
                const options = [];
                let correctAnswer = null;
                
                // Extract options
                let optionMatch;
                let optionIndex = 0;
                const optionsText = fullQuestionText.substring(questionText.length);
                const optionsRegexInstance = new RegExp(optionsRegex);
                
                while ((optionMatch = optionsRegexInstance.exec(optionsText)) !== null) {
                    const optionLetter = optionMatch[1];
                    const optionText = cleanText(optionMatch[2]);
                    
                    options.push(optionText);
                    
                    // For the purpose of this example, we'll set a random correct answer
                    // In a real implementation, you would need to extract the answer key
                    if (correctAnswer === null) {
                        correctAnswer = optionIndex; // Just use the first option as correct for now
                    }
                    
                    optionIndex++;
                }
                
                // Add to questions array if we have a valid question with options
                if (options.length > 0) {
                    questionSet.questions.push({
                        questionText,
                        options,
                        correctAnswer
                    });
                }
            }
        }
        
        // Only add sets that have at least one question
        if (questionSet.questions.length > 0) {
            mcqSets.push(questionSet);
        }
    }
    
    return mcqSets;
}

/**
 * Clean up text by removing extra whitespace, newlines, etc.
 * @param {string} text - Raw text to clean
 * @returns {string} - Cleaned text
 */
function cleanText(text) {
    return text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, ' ')
        .trim();
}

/**
 * Identify the time period a question belongs to based on keywords
 * @param {string} text - Stimulus text to analyze
 * @returns {string} - Time period name
 */
function identifyTimePeriod(text) {
    const lowerText = text.toLowerCase();
    
    // Check each time period for keyword matches
    let bestPeriod = TIME_PERIODS[0];
    let bestScore = 0;
    
    for (const period of TIME_PERIODS) {
        let score = 0;
        for (const keyword of period.keywords) {
            if (lowerText.includes(keyword.toLowerCase())) {
                score++;
            }
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestPeriod = period;
        }
    }
    
    return bestPeriod.name;
}