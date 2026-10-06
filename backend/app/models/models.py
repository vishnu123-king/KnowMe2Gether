import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class Owner(Base):
    __tablename__ = "owners"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    token = Column(String(128), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    tests = relationship("Test", back_populates="owner", cascade="all, delete-orphan")

class Test(Base):
    __tablename__ = "tests"

    id = Column(String(64), primary_key=True, index=True)
    owner_id = Column(String(64), ForeignKey("owners.id"), nullable=False)
    title = Column(String(255), nullable=False, default="How Well Do You Know Me?")
    description = Column(Text, nullable=True)
    responder_name = Column(String(128), nullable=False)
    responder_token = Column(String(64), unique=True, index=True, nullable=False)
    status = Column(String(32), default="waiting")  # "waiting" | "completed"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    owner = relationship("Owner", back_populates="tests")
    questions = relationship("Question", back_populates="test", order_by="Question.question_order", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="test", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(String(64), primary_key=True, index=True)
    test_id = Column(String(64), ForeignKey("tests.id"), nullable=False)
    question_type = Column(String(32), nullable=False)  # "text" | "multiple_choice" | "yes_no"
    question_text = Column(Text, nullable=False)
    question_order = Column(Integer, nullable=False)
    correct_answer = Column(Text, nullable=False)

    test = relationship("Test", back_populates="questions")
    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan")
    accepted_answers = relationship("AcceptedAnswer", back_populates="question", cascade="all, delete-orphan")

class QuestionOption(Base):
    __tablename__ = "question_options"

    id = Column(String(64), primary_key=True, index=True)
    question_id = Column(String(64), ForeignKey("questions.id"), nullable=False)
    option_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)

    question = relationship("Question", back_populates="options")

class AcceptedAnswer(Base):
    __tablename__ = "accepted_answers"

    id = Column(String(64), primary_key=True, index=True)
    question_id = Column(String(64), ForeignKey("questions.id"), nullable=False)
    answer_text = Column(Text, nullable=False)

    question = relationship("Question", back_populates="accepted_answers")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String(64), primary_key=True, index=True)
    test_id = Column(String(64), ForeignKey("tests.id"), nullable=False)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    score = Column(Integer, nullable=False)
    percentage = Column(Integer, nullable=False)

    test = relationship("Test", back_populates="submissions")
    answers = relationship("Answer", back_populates="submission", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(String(64), primary_key=True, index=True)
    submission_id = Column(String(64), ForeignKey("submissions.id"), nullable=False)
    question_id = Column(String(64), ForeignKey("questions.id"), nullable=False)
    answer_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=False)

    submission = relationship("Submission", back_populates="answers")
