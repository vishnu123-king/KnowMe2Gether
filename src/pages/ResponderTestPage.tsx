import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicTest, ResponderAnswerSubmission } from '../types';
import { fetchPublicTest, submitPublicAnswers } from '../services/api';
import { AnimatedTeddy } from '../components/AnimatedTeddy';
import { AnimatedPanda } from '../components/AnimatedPanda';
import { triggerLoveConfetti } from '../animations/Confetti';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Heart,
  Send,
  AlertCircle,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface ResponderTestPageProps {
  token: string;
  onNavigateHome: () => void;
}

export const ResponderTestPage: React.FC<ResponderTestPageProps> = ({
  token,
  onNavigateHome,
}) => {
  const [test, setTest] = useState<PublicTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  // Flow state:
  // 'welcome' | 'questions' | 'confirm' | 'completed'
  const [stepState, setStepState] = useState<'welcome' | 'questions' | 'confirm' | 'completed'>('welcome');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchPublicTest(token)
      .then((data) => {
        if (!isMounted) return;
        setTest(data);
        if (data.completed) {
          setAlreadyCompleted(true);
        }
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setErrorMsg(err.message || 'This friendship test doesn\'t exist or is no longer available.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleStart = () => {
    setStepState('questions');
    setCurrentIndex(0);
  };

  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
    setInputError('');
  };

  const currentQ = test?.questions?.[currentIndex];

  const handleNext = () => {
    if (!currentQ) return;
    const currentAns = (answers[currentQ.id] || '').trim();
    if (!currentAns) {
      setInputError('Please provide an answer before continuing.');
      return;
    }

    if (currentIndex < (test?.questions.length || 0) - 1) {
      setCurrentIndex((prev) => prev + 1);
      setInputError('');
    } else {
      // Reached end of questions
      setStepState('confirm');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setInputError('');
    } else {
      setStepState('welcome');
    }
  };

  const handleSubmitFinal = async () => {
    if (!test) return;
    setIsSubmitting(true);
    setInputError('');

    try {
      const submissions: ResponderAnswerSubmission[] = test.questions.map((q) => ({
        questionId: q.id,
        answerText: (answers[q.id] || '').trim(),
      }));

      await submitPublicAnswers(token, submissions);
      triggerLoveConfetti();
      setStepState('completed');
    } catch (err: any) {
      setInputError(err.message || 'Something went wrong while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <AnimatedTeddy pose="thinking" size={120} />
        <p className="text-sm font-bold text-slate-600 animate-pulse">
          Loading Friendship Test...
        </p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5">
        <div className="flex justify-center">
          <AnimatedTeddy pose="waiting" size={130} />
        </div>
        <div className="bg-white rounded-3xl border-2 border-rose-100 p-6 shadow-md space-y-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">
            Oops! Test Unavailable
          </h2>
          <p className="text-sm text-slate-600">
            {errorMsg}
          </p>
          <div className="pt-2">
            <button
              onClick={onNavigateHome}
              className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              Go to Home Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (alreadyCompleted) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5">
        <div className="flex justify-center">
          <AnimatedTeddy pose="happy" size={140} />
        </div>
        <div className="bg-white rounded-3xl border-2 border-rose-100 p-6 shadow-md space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">
            This test has already been submitted! ❤️
          </h2>
          <p className="text-sm text-slate-600">
            Your answers were recorded safely. Only the test owner can view the responses.
          </p>
          <div className="pt-2">
            <button
              onClick={onNavigateHome}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              Create Your Own Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!test) return null;

  const totalQuestions = test.questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="max-w-lg mx-auto px-3.5 sm:px-4 py-5 sm:py-10 safe-bottom">
      {/* Step 1: Welcome Screen */}
      {stepState === 'welcome' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl sm:rounded-3xl border-2 border-rose-100 p-5 sm:p-8 shadow-xl text-center space-y-5 sm:space-y-6"
        >
          <div className="flex justify-center items-center gap-2 sm:gap-3">
            <AnimatedTeddy pose="waving" size={95} />
            <AnimatedPanda pose="waving" size={95} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Friendship Quiz</span>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {test.title || 'How Well Do You Know Me?'}
            </h1>
            <p className="text-sm sm:text-base font-bold text-rose-600">
              Ready? Let's see how well you know {test.ownerName}! 🌟
            </p>
            {test.description && (
              <p className="text-xs sm:text-sm text-slate-500 italic max-w-sm mx-auto">
                “{test.description}”
              </p>
            )}
          </div>

          <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 text-xs text-slate-600 text-left space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-rose-800 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Rules:</span>
            </div>
            <p>• {totalQuestions} custom questions prepared by {test.ownerName}.</p>
            <p>• Take your time and answer as genuinely as you can.</p>
            <p>• Results stay 100% private with the test owner.</p>
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-base shadow-lg shadow-rose-200 hover:shadow-xl transition-all cursor-pointer"
          >
            <span>Start Test Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Step 2: Question View (One at a time) */}
      {stepState === 'questions' && currentQ && (
        <div className="space-y-4">
          {/* Progress Bar Header */}
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl border border-rose-100 p-3.5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
              <span className="text-rose-600">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span>{progressPercent}% Complete</span>
            </div>
            {/* Animated Progress Bar */}
            <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl sm:rounded-3xl border-2 border-rose-100 p-4 sm:p-7 shadow-xl space-y-4 sm:space-y-6"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                  {currentQ.type === 'multiple_choice' ? 'Multiple Choice' : currentQ.type === 'yes_no' ? 'Yes / No' : 'Text Answer'}
                </span>

                {currentIndex % 2 === 0 ? (
                  <AnimatedTeddy pose="thinking" size={46} />
                ) : (
                  <AnimatedPanda pose="thinking" size={46} />
                )}
              </div>

              {/* Question Text */}
              <h2 className="text-lg sm:text-2xl font-black text-slate-800 leading-snug">
                {currentQ.text}
              </h2>

              {/* Input for Text Question */}
              {currentQ.type === 'text' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    placeholder="Type your answer..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleNext();
                      }
                    }}
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 text-base font-semibold text-slate-800 placeholder-slate-400 transition-all"
                  />
                  <p className="text-[11px] text-slate-400">
                    Spelling doesn't have to be exact—we automatically normalize punctuation and casing!
                  </p>
                </div>
              )}

              {/* Multiple Choice Options */}
              {currentQ.type === 'multiple_choice' && (
                <div className="space-y-2.5">
                  {(currentQ.options || []).map((opt, optIdx) => {
                    const isSelected = answers[currentQ.id] === opt;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleAnswerChange(currentQ.id, opt)}
                        className={`w-full p-4 rounded-2xl border-2 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50/80 text-rose-800 ring-2 ring-rose-200'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="flex-1 pr-2">{opt}</span>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-rose-500 bg-rose-500' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Yes / No Options */}
              {currentQ.type === 'yes_no' && (
                <div className="grid grid-cols-2 gap-3.5">
                  {(['Yes', 'No'] as const).map((choice) => {
                    const isSelected = answers[currentQ.id] === choice;
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => handleAnswerChange(currentQ.id, choice)}
                        className={`py-5 px-4 rounded-2xl border-2 font-extrabold text-lg flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-200 shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>{choice === 'Yes' ? '👍 Yes' : '👎 No'}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {inputError && (
                <p className="text-xs text-rose-600 font-bold">{inputError}</p>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{currentIndex === 0 ? 'Home' : 'Back'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 py-3 px-6 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
                >
                  <span>{currentIndex === totalQuestions - 1 ? 'Finish' : 'Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Step 3: Final Confirmation Screen */}
      {stepState === 'confirm' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border-2 border-rose-100 p-6 sm:p-8 shadow-xl text-center space-y-6"
        >
          <div className="flex justify-center">
            <AnimatedTeddy pose="thinking" size={140} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
              Are you ready?
            </h2>
            <p className="text-sm text-slate-600">
              You answered all {totalQuestions} questions! Submitting will record your responses for {test.ownerName}.
            </p>
          </div>

          {inputError && (
            <p className="text-xs text-rose-600 font-bold">{inputError}</p>
          )}

          <div className="space-y-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitFinal}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-base shadow-lg shadow-rose-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Answers...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Submit My Answers ✨</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setStepState('questions');
                setCurrentIndex(totalQuestions - 1);
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              Go Back & Review Answers
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Completion Screen (NEVER displays score or answers!) */}
      {stepState === 'completed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border-2 border-rose-100 p-8 shadow-2xl text-center space-y-6"
        >
          <div className="flex justify-center items-center gap-3">
            <AnimatedTeddy pose="celebrating" size={130} />
            <AnimatedPanda pose="celebrating" size={130} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Submission Successful</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              All Done! ❤️
            </h1>
            <p className="text-base font-bold text-slate-700">
              Your answers have been submitted successfully.
            </p>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              The test owner can now view your answers privately on their dashboard.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
            >
              Create Your Own Friendship Quiz
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
