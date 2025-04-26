"use client"

import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/app/components/UI/radio-group"
import { CheckCircle2, XCircle, Award, BookOpen } from "lucide-react"
import { Progress } from "@/app/components/UI/progress"
import { Quizes } from "@prisma/client"
import { Button } from "../UI/button"
import MarkdownContent from "../markDown"
import { Label } from "../UI/label"
import { Card } from "../UI/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../UI/dialog"


export function ChapterQuiz({ quiz }: { quiz: Quizes[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)


  const handleStartQuiz = () => {
    setIsOpen(true)
    setCurrentQuestionIndex(0)
    setSelectedAnswers(Array(quiz.length).fill(-1))
    setShowResults(false)
    setScore(0)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Calculate score
      let correctCount = 0
      selectedAnswers.forEach((answer, index) => {
        if (answer === quiz[index].correctAnswerIndex) {
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
    setSelectedAnswers(Array(quiz.length).fill(-1))
    setShowResults(false)
    setScore(0)
  }

  const currentQuestion = quiz[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.length) * 100

  return (
    <>
      <Button onClick={handleStartQuiz} className="w-full bg-primary hover:bg-primary/90 text-white">
        <BookOpen className="mr-2 h-4 w-4" />
        Testez vos connaissances
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz du chapitre</DialogTitle>
            <DialogDescription>Testez votre compréhension des concepts de ce chapitre.</DialogDescription>
          </DialogHeader>

          {!showResults ? (
            <>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>
                    Question {currentQuestionIndex + 1} of {quiz.length}
                  </span>
                  <span>Progression: {Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="py-4">
                <div className="text-lg font-medium mb-4">
                  <MarkdownContent
                    style={{ backgroundColor: "inherit", color: "inherit" }}
                    content={currentQuestion.question} />                    
                </div>

                <RadioGroup
                  value={selectedAnswers[currentQuestionIndex]?.toString() || ""}
                  onValueChange={(value) => handleAnswerSelect(Number.parseInt(value))}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer">
                        <MarkdownContent
                          style={{ backgroundColor: "inherit", color: "inherit" }}
                          content={option} />
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
                  {currentQuestionIndex === quiz.length - 1 ? "Finish" : "Next"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Résultats du quiz</h3>
                <p className="text-gray-500 mt-2">
                  Vous avez obtenu {score} sur {quiz.length} ({Math.round((score / quiz.length) * 100)}%)
                </p>
              </div>

              <div className="space-y-6 mt-6">
                {quiz.map((question, index) => {
                  const isCorrect = selectedAnswers[index] === question.correctAnswerIndex

                  return (
                    <Card
                      key={question.quizId}
                      className={`p-4 border ${isCorrect ? "border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900" : "border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900"}`}
                    >
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-medium">
                            <MarkdownContent
                              style={{ backgroundColor: "inherit" }}
                              content={question.question} />
                          </div>

                          <div className="mt-2 text-sm">
                            <p className="font-medium">
                              Votre réponse:{" "}
                              {selectedAnswers[index] >= 0
                                ? question.options[selectedAnswers[index]]
                                : "No answer selected"}
                            </p>

                            {!isCorrect && (
                              <div className="font-medium text-green-600 dark:text-green-400 mt-1">
                                <MarkdownContent
                                  style={{ backgroundColor: "inherit", color: "inherit" }}
                                  content={`Réponse correcte: ${question.options[question.correctAnswerIndex]}`} />
                              </div>
                            )}

                            <div className="mt-2 text-gray-600 dark:text-gray-400">
                              <MarkdownContent
                                style={{ backgroundColor: "inherit", color: "inherit" }}
                                content={question.explaination} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={handleRestartQuiz}>
                  Redémarrer le quiz
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

