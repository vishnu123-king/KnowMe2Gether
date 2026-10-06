import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QuestionDraft, QuestionType } from '../types';
import {
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Plus,
  CheckCircle2,
  HelpCircle,
  ListFilter,
  ToggleLeft,
  X,
  Sparkles
} from 'lucide-react';

interface QuestionBuilderProps {
  questions: QuestionDraft[];
  onChange: (questions: QuestionDraft[]) => void;
}

export const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  questions,
  onChange,
}) => {
  const addQuestion = () => {
    const newQ: QuestionDraft = {
      id: 'q_' + Math.random().toString(36).substring(2, 9),
      type: 'text',
      text: '',
      order: questions.length + 1,
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: '',
      acceptedAnswers: [],
    };
    onChange([...questions, newQ]);
  };

  const updateQuestion = (id: string, updates: Partial<QuestionDraft>) => {
    onChange(
      questions.map((q) => {
        if (q.id === id) {
          const updated = { ...q, ...updates };
          // If switching to yes_no, ensure default options and correct answer
          if (updates.type === 'yes_no') {
            updated.options = ['Yes', 'No'];
            if (updated.correctAnswer !== 'Yes' && updated.correctAnswer !== 'No') {
              updated.correctAnswer = 'Yes';
            }
          } else if (updates.type === 'multiple_choice') {
            if (!updated.options || updated.options.length === 0) {
              updated.options = ['Option A', 'Option B', 'Option C', 'Option D'];
            }
            if (!updated.options.includes(updated.correctAnswer)) {
              updated.correctAnswer = updated.options[0];
            }
          }
          return updated;
        }
        return q;
      })
    );
  };

  const deleteQuestion = (id: string) => {
    if (questions.length <= 1) {
      alert('You need at least 1 question to continue editing.');
      return;
    }
    const filtered = questions.filter((q) => q.id !== id);
    // reindex order
    onChange(filtered.map((q, idx) => ({ ...q, order: idx + 1 })));
  };

  const duplicateQuestion = (id: string) => {
    const targetIdx = questions.findIndex((q) => q.id === id);
    if (targetIdx === -1) return;
    const target = questions[targetIdx];
    const duplicated: QuestionDraft = {
      ...target,
      id: 'q_' + Math.random().toString(36).substring(2, 9),
      text: `${target.text} (Copy)`,
      options: [...target.options],
      acceptedAnswers: [...target.acceptedAnswers],
    };
    const nextList = [...questions];
    nextList.splice(targetIdx + 1, 0, duplicated);
    onChange(nextList.map((q, idx) => ({ ...q, order: idx + 1 })));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const nextList = [...questions];
    const [moved] = nextList.splice(index, 1);
    nextList.splice(targetIdx, 0, moved);
    onChange(nextList.map((q, idx) => ({ ...q, order: idx + 1 })));
  };

  const handleAddOption = (qId: string) => {
    const q = questions.find((item) => item.id === qId);
    if (!q) return;
    const nextOptionName = `Option ${q.options.length + 1}`;
    updateQuestion(qId, {
      options: [...q.options, nextOptionName],
    });
  };

  const handleOptionChange = (qId: string, optIdx: number, val: string) => {
    const q = questions.find((item) => item.id === qId);
    if (!q) return;
    const newOptions = [...q.options];
    const oldVal = newOptions[optIdx];
    newOptions[optIdx] = val;
    const updates: Partial<QuestionDraft> = { options: newOptions };
    // If the changed option was the selected correct answer, keep track of it
    if (q.correctAnswer === oldVal) {
      updates.correctAnswer = val;
    }
    updateQuestion(qId, updates);
  };

  const handleRemoveOption = (qId: string, optIdx: number) => {
    const q = questions.find((item) => item.id === qId);
    if (!q || q.options.length <= 2) return;
    const removedVal = q.options[optIdx];
    const newOptions = q.options.filter((_, i) => i !== optIdx);
    const updates: Partial<QuestionDraft> = { options: newOptions };
    if (q.correctAnswer === removedVal) {
      updates.correctAnswer = newOptions[0] || '';
    }
    updateQuestion(qId, updates);
  };

  const handleAddAcceptedAnswer = (qId: string, val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    const q = questions.find((item) => item.id === qId);
    if (!q) return;
    if (!q.acceptedAnswers.includes(trimmed)) {
      updateQuestion(qId, {
        acceptedAnswers: [...q.acceptedAnswers, trimmed],
      });
    }
  };

  const handleRemoveAcceptedAnswer = (qId: string, itemIdx: number) => {
    const q = questions.find((item) => item.id === qId);
    if (!q) return;
    updateQuestion(qId, {
      acceptedAnswers: q.acceptedAnswers.filter((_, i) => i !== itemIdx),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>Custom Questions</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold">
              {questions.length} / min 3
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Create any question you want! Choose free-text, multiple choice, or yes/no.
          </p>
        </div>

        <button
          type="button"
          onClick={addQuestion}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {questions.map((q, index) => (
            <motion.div
              key={q.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border-2 border-rose-100/80 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-rose-50 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 font-extrabold text-sm flex items-center justify-center">
                    {index + 1}
                  </div>
                  <span className="font-bold text-slate-700 text-sm">
                    Question {index + 1}
                  </span>
                </div>

                {/* Actions: Move, Duplicate, Delete */}
                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveQuestion(index, 'up')}
                    title="Move up"
                    className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === questions.length - 1}
                    onClick={() => moveQuestion(index, 'down')}
                    title="Move down"
                    className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateQuestion(q.id)}
                    title="Duplicate question"
                    className="p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteQuestion(q.id)}
                    title="Delete question"
                    className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Question Text <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                    placeholder="e.g. What is my favorite food?"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-3 focus:ring-rose-100 transition-all text-sm font-medium text-slate-800 placeholder-slate-400"
                  />
                </div>

                {/* Question Type Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Question Type
                  </label>
                  <div className="grid grid-cols-3 gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuestion(q.id, { type: 'text' })}
                      className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1.5 sm:px-3 rounded-xl border text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                        q.type === 'text'
                          ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Text</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateQuestion(q.id, { type: 'multiple_choice' })}
                      className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1.5 sm:px-3 rounded-xl border text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                        q.type === 'multiple_choice'
                          ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <ListFilter className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Choice</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateQuestion(q.id, { type: 'yes_no' })}
                      className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1.5 sm:px-3 rounded-xl border text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                        q.type === 'yes_no'
                          ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <ToggleLeft className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Yes / No</span>
                    </button>
                  </div>
                </div>

                {/* Answer Definition Based on Type */}
                {q.type === 'text' && (
                  <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3.5 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-rose-900 mb-1">
                        Correct Answer <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={q.correctAnswer}
                        onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
                        placeholder="e.g. Pizza"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 text-sm font-semibold text-slate-800"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Matching is case-insensitive and trims punctuation automatically.
                      </p>
                    </div>

                    {/* Extra Accepted Answers */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Additional Accepted Spellings / Synonyms (Optional)
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {q.acceptedAnswers.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-rose-200 text-rose-800 rounded-lg text-xs font-medium"
                          >
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAcceptedAnswer(q.id, idx)}
                              className="text-rose-400 hover:text-rose-700 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id={`extra_answer_${q.id}`}
                          placeholder="e.g. Pepperoni pizza"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddAcceptedAnswer(q.id, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:border-rose-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById(`extra_answer_${q.id}`) as HTMLInputElement;
                            if (input) {
                              handleAddAcceptedAnswer(q.id, input.value);
                              input.value = '';
                            }
                          }}
                          className="px-3 py-1.5 bg-rose-200 hover:bg-rose-300 text-rose-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {q.type === 'multiple_choice' && (
                  <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-rose-900">
                        Answer Options (Select the correct one) <span className="text-rose-500">*</span>
                      </label>
                      {q.options.length < 6 && (
                        <button
                          type="button"
                          onClick={() => handleAddOption(q.id)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                        >
                          + Add Option
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctAnswer === opt;
                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                              isCorrect
                                ? 'bg-white border-green-400 ring-2 ring-green-100'
                                : 'bg-white/80 border-slate-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct_opt_${q.id}`}
                              checked={isCorrect}
                              onChange={() => updateQuestion(q.id, { correctAnswer: opt })}
                              className="w-4 h-4 text-green-600 focus:ring-green-400 cursor-pointer accent-green-600"
                            />

                            <input
                              type="text"
                              required
                              value={opt}
                              onChange={(e) => handleOptionChange(q.id, optIdx, e.target.value)}
                              placeholder={`Option ${optIdx + 1}`}
                              className="flex-1 bg-transparent border-none text-xs font-medium text-slate-800 focus:outline-none"
                            />

                            {isCorrect && (
                              <span className="text-[10px] font-extrabold text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Correct
                              </span>
                            )}

                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(q.id, optIdx)}
                                className="text-slate-300 hover:text-red-500 p-1 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {q.type === 'yes_no' && (
                  <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3.5">
                    <label className="block text-xs font-bold text-rose-900 mb-2">
                      Correct Answer <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['Yes', 'No'] as const).map((choice) => {
                        const isSelected = q.correctAnswer === choice;
                        return (
                          <button
                            key={choice}
                            type="button"
                            onClick={() => updateQuestion(q.id, { correctAnswer: choice })}
                            className={`py-3 px-4 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-green-500 bg-green-50 text-green-800 shadow-xs'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-green-600 bg-green-600' : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                            <span>{choice}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-dashed border-rose-300 hover:border-rose-400 bg-rose-50/50 hover:bg-rose-50 text-rose-600 font-bold text-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Question</span>
        </button>
      </div>
    </div>
  );
};
