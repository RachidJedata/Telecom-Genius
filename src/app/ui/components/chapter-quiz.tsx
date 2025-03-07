"use client"

import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "./radio-group"
import { CheckCircle2, XCircle, Award, BookOpen } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { Progress } from "./progress"
import { Button } from "./button"
import { Label } from "./label"
import { Card } from "./card"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

// Sample quiz questions for each chapter
const chapterQuizzes: Record<string, QuizQuestion[]> = {
  "wireless-fundamentals": [
    {
      id: "wf-q1",
      question: "Which of the following frequency ranges is typically used for Wi-Fi networks?",
      options: ["900 MHz", "2.4 GHz", "10 GHz", "50 GHz"],
      correctAnswer: 1,
      explanation:
        "Wi-Fi networks typically operate in the 2.4 GHz and 5 GHz frequency bands. The 2.4 GHz band is the most commonly used frequency range for Wi-Fi.",
    },
    {
      id: "wf-q2",
      question: "What is modulation in wireless communications?",
      options: [
        "The process of increasing signal power",
        "The process of varying properties of a carrier signal with a modulating signal",
        "The process of filtering unwanted frequencies",
        "The process of converting analog signals to digital",
      ],
      correctAnswer: 1,
      explanation:
        "Modulation is the process of varying one or more properties of a periodic waveform (carrier signal) with a modulating signal that typically contains information to be transmitted.",
    },
    {
      id: "wf-q3",
      question: "Which of the following is NOT a type of wireless signal propagation?",
      options: ["Reflection", "Diffraction", "Scattering", "Amplification"],
      correctAnswer: 3,
      explanation:
        "The three main mechanisms of wireless signal propagation are reflection, diffraction, and scattering. Amplification is a process to increase signal strength, not a propagation mechanism.",
    },
    {
      id: "wf-q4",
      question: "What unit is used to measure frequency?",
      options: ["Watts", "Decibels", "Hertz", "Meters"],
      correctAnswer: 2,
      explanation: "Frequency is measured in Hertz (Hz), which represents the number of cycles per second.",
    },
    {
      id: "wf-q5",
      question: "Which of the following modulation techniques is commonly used in digital communications?",
      options: [
        "Amplitude Modulation (AM)",
        "Frequency Modulation (FM)",
        "Quadrature Amplitude Modulation (QAM)",
        "All of the above",
      ],
      correctAnswer: 3,
      explanation:
        "All of these modulation techniques are used in digital communications. AM and FM are also used in analog communications, while QAM is primarily used in digital systems.",
    },
  ],
  "radio-networks": [
    {
      id: "rn-q1",
      question: "What is a cell in cellular network terminology?",
      options: [
        "A mobile phone",
        "A geographic area covered by a base station",
        "A type of battery",
        "A network protocol",
      ],
      correctAnswer: 1,
      explanation:
        "In cellular networks, a cell refers to a geographic area covered by a base station (cell tower). The network is divided into these cells to efficiently reuse frequencies.",
    },
    {
      id: "rn-q2",
      question: "What is handover in cellular networks?",
      options: [
        "The process of transferring a call from one cell to another",
        "The process of authenticating a user",
        "The process of encrypting data",
        "The process of billing for services",
      ],
      correctAnswer: 0,
      explanation:
        "Handover (or handoff) is the process of transferring an ongoing call or data session from one cell to another without interruption as a mobile user moves between cells.",
    },
    {
      id: "rn-q3",
      question: "What does MIMO stand for in radio communications?",
      options: [
        "Mobile Input Mobile Output",
        "Multiple Input Multiple Output",
        "Modulated Input Modulated Output",
        "Managed Input Managed Output",
      ],
      correctAnswer: 1,
      explanation:
        "MIMO stands for Multiple Input Multiple Output, which is a method for multiplying the capacity of a radio link using multiple transmission and receiving antennas.",
    },
    {
      id: "rn-q4",
      question: "Which of the following is NOT a cellular network generation?",
      options: ["3G", "4G", "5G", "6H"],
      correctAnswer: 3,
      explanation:
        "3G, 4G, and 5G are all generations of cellular network technology. 6H is not a standard generation designation (the next generation after 5G would be 6G).",
    },
    {
      id: "rn-q5",
      question: "What is the main purpose of Radio Resource Management (RRM)?",
      options: [
        "To manage user billing",
        "To control co-channel interference and optimize radio transmission",
        "To encrypt radio transmissions",
        "To manage user authentication",
      ],
      correctAnswer: 1,
      explanation:
        "Radio Resource Management (RRM) is the system level control of co-channel interference and other radio transmission characteristics in wireless communication systems.",
    },
  ],
  // Default quiz for other chapters
  default: [
    {
      id: "default-q1",
      question: "Which of the following is a benefit of digital signal processing?",
      options: ["Lower power consumption", "Immunity to noise", "Flexibility in implementation", "All of the above"],
      correctAnswer: 3,
      explanation:
        "Digital signal processing offers multiple benefits including lower power consumption, better immunity to noise, and flexibility in implementation through software changes.",
    },
    {
      id: "default-q2",
      question: "What is the primary purpose of a network protocol?",
      options: [
        "To encrypt data",
        "To define rules for communication between devices",
        "To increase network speed",
        "To reduce hardware costs",
      ],
      correctAnswer: 1,
      explanation:
        "Network protocols define the rules and conventions for communication between network devices, including message formatting, transmission, reception, and error handling.",
    },
    {
      id: "default-q3",
      question: "Which layer of the OSI model is responsible for routing?",
      options: ["Physical Layer", "Data Link Layer", "Network Layer", "Transport Layer"],
      correctAnswer: 2,
      explanation:
        "The Network Layer (Layer 3) of the OSI model is responsible for routing packets between networks, addressing, and path determination.",
    },
  ],
}

export function ChapterQuiz({ chapterId }: { chapterId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  // Get questions for this chapter or use default
  const questions = chapterQuizzes[chapterId] || chapterQuizzes.default

  const handleStartQuiz = () => {
    setIsOpen(true)
    setCurrentQuestionIndex(0)
    setSelectedAnswers(Array(questions.length).fill(-1))
    setShowResults(false)
    setScore(0)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Calculate score
      let correctCount = 0
      selectedAnswers.forEach((answer, index) => {
        if (answer === questions[index].correctAnswer) {
          correctCount++
        }
      })
      setScore(correctCount)
      setShowResults(true)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleCloseQuiz = () => {
    setIsOpen(false)
  }

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers(Array(questions.length).fill(-1))
    setShowResults(false)
    setScore(0)
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <>
      <Button onClick={handleStartQuiz} className="w-full bg-primary hover:bg-primary/90 text-white">
        <BookOpen className="mr-2 h-4 w-4" />
        Test Your Knowledge
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chapter Quiz</DialogTitle>
            <DialogDescription>Test your understanding of the concepts in this chapter.</DialogDescription>
          </DialogHeader>

          {!showResults ? (
            <>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span>Progress: {Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="py-4">
                <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>

                <RadioGroup
                  value={selectedAnswers[currentQuestionIndex]?.toString() || ""}
                  onValueChange={(value) => handleAnswerSelect(Number.parseInt(value))}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <DialogFooter className="flex justify-between">
                <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                  Previous
                </Button>
                <Button onClick={handleNextQuestion} disabled={selectedAnswers[currentQuestionIndex] === -1}>
                  {currentQuestionIndex === questions.length - 1 ? "Finish" : "Next"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Quiz Results</h3>
                <p className="text-gray-500 mt-2">
                  You scored {score} out of {questions.length} ({Math.round((score / questions.length) * 100)}%)
                </p>
              </div>

              <div className="space-y-6 mt-6">
                {questions.map((question, index) => {
                  const isCorrect = selectedAnswers[index] === question.correctAnswer

                  return (
                    <Card
                      key={question.id}
                      className={`p-4 border ${isCorrect ? "border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900" : "border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900"}`}
                    >
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h4 className="font-medium">{question.question}</h4>

                          <div className="mt-2 text-sm">
                            <p className="font-medium">
                              Your answer:{" "}
                              {selectedAnswers[index] >= 0
                                ? question.options[selectedAnswers[index]]
                                : "No answer selected"}
                            </p>

                            {!isCorrect && (
                              <p className="font-medium text-green-600 dark:text-green-400 mt-1">
                                Correct answer: {question.options[question.correctAnswer]}
                              </p>
                            )}

                            <p className="mt-2 text-gray-600 dark:text-gray-400">{question.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={handleRestartQuiz}>
                  Restart Quiz
                </Button>
                <Button onClick={handleCloseQuiz}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

