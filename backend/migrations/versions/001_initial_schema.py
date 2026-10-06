"""Initial schema migration

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-05 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # owners table
    op.create_table(
        'owners',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('name', sa.String(length=128), nullable=False),
        sa.Column('token', sa.String(length=128), nullable=False, unique=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )
    op.create_index('ix_owners_id', 'owners', ['id'])
    op.create_index('ix_owners_token', 'owners', ['token'])

    # tests table
    op.create_table(
        'tests',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('owner_id', sa.String(length=64), sa.ForeignKey('owners.id'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('responder_name', sa.String(length=128), nullable=False),
        sa.Column('responder_token', sa.String(length=64), nullable=False, unique=True),
        sa.Column('status', sa.String(length=32), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
    )
    op.create_index('ix_tests_id', 'tests', ['id'])
    op.create_index('ix_tests_responder_token', 'tests', ['responder_token'])

    # questions table
    op.create_table(
        'questions',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('test_id', sa.String(length=64), sa.ForeignKey('tests.id'), nullable=False),
        sa.Column('question_type', sa.String(length=32), nullable=False),
        sa.Column('question_text', sa.Text(), nullable=False),
        sa.Column('question_order', sa.Integer(), nullable=False),
        sa.Column('correct_answer', sa.Text(), nullable=False),
    )
    op.create_index('ix_questions_id', 'questions', ['id'])

    # question_options table
    op.create_table(
        'question_options',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('question_id', sa.String(length=64), sa.ForeignKey('questions.id'), nullable=False),
        sa.Column('option_text', sa.Text(), nullable=False),
        sa.Column('is_correct', sa.Boolean(), default=False),
    )
    op.create_index('ix_question_options_id', 'question_options', ['id'])

    # accepted_answers table
    op.create_table(
        'accepted_answers',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('question_id', sa.String(length=64), sa.ForeignKey('questions.id'), nullable=False),
        sa.Column('answer_text', sa.Text(), nullable=False),
    )
    op.create_index('ix_accepted_answers_id', 'accepted_answers', ['id'])

    # submissions table
    op.create_table(
        'submissions',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('test_id', sa.String(length=64), sa.ForeignKey('tests.id'), nullable=False),
        sa.Column('submitted_at', sa.DateTime(), nullable=True),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('percentage', sa.Integer(), nullable=False),
    )
    op.create_index('ix_submissions_id', 'submissions', ['id'])

    # answers table
    op.create_table(
        'answers',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('submission_id', sa.String(length=64), sa.ForeignKey('submissions.id'), nullable=False),
        sa.Column('question_id', sa.String(length=64), sa.ForeignKey('questions.id'), nullable=False),
        sa.Column('answer_text', sa.Text(), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=False),
    )
    op.create_index('ix_answers_id', 'answers', ['id'])

def downgrade() -> None:
    op.drop_table('answers')
    op.drop_table('submissions')
    op.drop_table('accepted_answers')
    op.drop_table('question_options')
    op.drop_table('questions')
    op.drop_table('tests')
    op.drop_table('owners')
