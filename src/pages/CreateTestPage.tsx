import React, { useState } from 'react';
import { motion } from 'motion/react';
import { QuestionBuilder } from '../components/QuestionBuilder';
import { ShareCard } from '../components/ShareCard';
import { QuestionDraft, OwnerTestSummary } from '../types';
import { createOwnerTest, rotateResponderLink } from '../services/api';
import { Heart, Sparkles, Send, AlertCircle, ArrowLeft } from 'lucide-react';
import { AnimatedTeddy } from '../components/AnimatedTeddy';
import { AnimatedPanda } from '../components/AnimatedPanda';

interface CreateTestPageProps {
  onNavigate: (path: string) => void;
}

export const CreateTestPage: React.FC<CreateTestPageProps> = ({ onNavigate }) => {
  const [ownerName, setOwnerName] = useState('');
  const [friendName, setFriendName] = useState('');
  const [title, setTitle] = useState('How Well Do You Know Me?');
  const [description, setDescription] = useState('');

  // Initial starter questions (3 custom editable questions)
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      id: 'q_1',
      type: 'text',
      text: 'What is my favorite comfort food?',
      order: 1,
      options: [],
      correctAnswer: 'Pizza',
      acceptedAnswers: ['pasta', 'burger', 'ice cream'],
    },
    {
      id: 'q_2',
      type: 'multiple_choice',
      text: 'Which activity would I choose for a lazy weekend?',
      order: 2,
      options: ['Binge-watching TV series', 'Going on an outdoor hike', 'Sleeping until noon', 'Cooking a fancy meal'],
      correctAnswer: 'Binge-watching TV series',
      acceptedAnswers: [],
    },
    {
      id: 'q_3',
      type: 'yes_no',
      text: 'Do I get scared easily during horror movies?',
      order: 3,
      options: ['Yes', 'No'],
      correctAnswer: 'Yes',
      acceptedAnswers: [],
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Result state after creation
  const [createdTest, setCreatedTest] = useState<{
    test: OwnerTestSummary;
    shareUrl: string;
    responderToken: string;
  } | null>(null);

  const [isRotating, setIsRotating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!ownerName.trim()) {
      setErrorMsg('Please enter your display name.');
      return;
    }
    if (!friendName.trim()) {
      setErrorMsg('Please enter your friend\'s name.');
      return;
    }
    if (questions.length < 3) {
      setErrorMsg('You need at least 3 questions to create a friendship test.');
      return;
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setErrorMsg(`Question ${i + 1} is missing the question text.`);
        return;
      }
      if (!q.correctAnswer.trim()) {
        setErrorMsg(`Question ${i + 1} is missing the correct answer.`);
        return;
      }
      if (q.type === 'multiple_choice') {
        const emptyOpt = q.options.some((opt) => !opt.trim());
        if (emptyOpt) {
          setErrorMsg(`Question ${i + 1} has an empty option.`);
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);
      const res = await createOwnerTest({
        ownerName: ownerName.trim(),
        friendName: friendName.trim(),
        title: title.trim() || 'How Well Do You Know Me?',
        description: description.trim(),
        questions: questions.map((q, idx) => ({
          type: q.type,
          text: q.text.trim(),
          order: idx + 1,
          options: q.type === 'multiple_choice' ? q.options.map((o) => o.trim()) : [],
          correctAnswer: q.correctAnswer.trim(),
          acceptedAnswers: q.acceptedAnswers.map((a) => a.trim()).filter(Boolean),
        })),
      });

      setCreatedTest({
        test: res.test,
        shareUrl: res.shareUrl,
        responderToken: res.responderToken,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create test. Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRotate = async () => {
    if (!createdTest) return;
    try {
      setIsRotating(true);
      const res = await rotateResponderLink(createdTest.test.id);
      setCreatedTest({
        ...createdTest,
        shareUrl: res.shareUrl,
        responderToken: res.responderToken,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to rotate link.');
    } finally {
      setIsRotating(false);
    }
  };

  // If already created, show the ShareCard!
  if (createdTest) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ShareCard
          shareUrl={createdTest.shareUrl}
          responderName={friendName}
          testTitle={title}
          responderToken={createdTest.responderToken}
          onRotateLink={handleRotate}
          isRotating={isRotating}
          onGoToDashboard={() => onNavigate('/dashboard')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </button>

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center items-center gap-3 mb-1">
          <AnimatedTeddy pose="thinking" size={100} />
          <AnimatedPanda pose="thinking" size={100} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Create Your Friendship Test
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Enter your details, write custom questions, and set the correct answers only you know!
        </p>
      </div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </motion.div>
      )}

      {/* Main Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details Card */}
        <div className="bg-white rounded-3xl border-2 border-rose-100 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-rose-50 pb-3">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <h2 className="font-extrabold text-base text-slate-800">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Your Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-3 focus:ring-rose-100 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Friend's Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="e.g. Jordan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-3 focus:ring-rose-100 text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Test Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="How Well Do You Know Me?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-3 focus:ring-rose-100 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description or Personal Note (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Answer honestly! Let's see if you really pay attention to our talks."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-3 focus:ring-rose-100 text-sm font-medium resize-none"
            />
          </div>
        </div>

        {/* Custom Question Builder */}
        <div className="bg-white/70 backdrop-blur-xs rounded-3xl border-2 border-rose-100/90 p-6 shadow-xs">
          <QuestionBuilder questions={questions} onChange={setQuestions} />
        </div>

        {/* Submit Action */}
        <div className="pt-2 text-center space-y-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 py-4 px-10 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-base shadow-lg shadow-rose-200/80 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Test...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Create Friendship Test</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-500">
            A unique shareable link will be generated immediately after creation.
          </p>
        </div>
      </form>
    </div>
  );
};
