-- 007-seed-domains-questions.sql
-- Seed the 12 coachability domains and 48 questions
-- IMPORTANT: Run this AFTER all schema migrations are complete

-- Clear existing data (optional - comment out if you want to preserve existing)
-- DELETE FROM questions;
-- DELETE FROM domains;

-- Domain 1: Openness to Feedback
INSERT INTO domains (id, name, description, order_index) VALUES
('d1', 'Openness to Feedback', 'Your ability to receive and act on feedback from others.', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q1', 'd1', 'I ask for feedback to help me improve.', 'LIKERT', 'BOTH', 1),
('q2', 'd1', 'I stay calm and listen carefully when receiving feedback.', 'LIKERT', 'BOTH', 2),
('q3', 'd1', 'I take action based on feedback I receive.', 'LIKERT', 'BOTH', 3),
('q4', 'd1', 'I welcome constructive criticism without becoming defensive.', 'LIKERT', 'BOTH', 4)
ON CONFLICT (id) DO NOTHING;

-- Domain 2: Self-Awareness
INSERT INTO domains (id, name, description, order_index) VALUES
('d2', 'Self-Awareness', 'Your understanding of your own strengths and areas for development.', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q5', 'd2', 'I have a realistic understanding of my strengths.', 'LIKERT', 'BOTH', 1),
('q6', 'd2', 'I acknowledge my areas for development.', 'LIKERT', 'BOTH', 2),
('q7', 'd2', 'I reflect on my behavior and its impact on others.', 'LIKERT', 'BOTH', 3),
('q8', 'd2', 'I demonstrate insight into how others perceive me.', 'LIKERT', 'BOTH', 4)
ON CONFLICT (id) DO NOTHING;

-- Domain 3: Learning Orientation
INSERT INTO domains (id, name, description, order_index) VALUES
('d3', 'Learning Orientation', 'Your enthusiasm for acquiring new skills and knowledge.', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q9', 'd3', 'I actively seek out learning opportunities.', 'LIKERT', 'BOTH', 1),
('q10', 'd3', 'I show curiosity about new approaches and methods.', 'LIKERT', 'BOTH', 2),
('q11', 'd3', 'I apply new knowledge and skills in my work.', 'LIKERT', 'BOTH', 3),
('q12', 'd3', 'I enjoy tackling challenging learning experiences.', 'LIKERT', 'BOTH', 4)
ON CONFLICT (id) DO NOTHING;

-- Domain 4: Change Readiness
INSERT INTO domains (id, name, description, order_index) VALUES
('d4', 'Change Readiness', 'Your ability to adapt to new situations and approaches.', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q13', 'd4', 'I adapt well to changing circumstances.', 'LIKERT', 'BOTH', 1),
('q14', 'd4', 'I embrace new ways of doing things.', 'LIKERT', 'BOTH', 2),
('q15', 'd4', 'I remain positive during periods of change.', 'LIKERT', 'BOTH', 3),
('q16', 'd4', 'I help others navigate through changes.', 'LIKERT', 'BOTH', 4)
ON CONFLICT (id) DO NOTHING;

-- Domain 5: Emotional Regulation
INSERT INTO domains (id, name, description, order_index) VALUES
('d5', 'Emotional Regulation', 'Your ability to manage emotions effectively in challenging situations.', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q17', 'd5', 'I stay calm under pressure.', 'LIKERT', 'BOTH', 1),
('q18', 'd5', 'I manage my emotions effectively in difficult situations.', 'LIKERT', 'BOTH', 2),
('q19', 'd5', 'I recover quickly from setbacks.', 'LIKERT', 'BOTH', 3),
('q20', 'd5', 'I maintain composure during conflicts.', 'LIKERT', 'BOTH', 4)
ON CONFLICT (id) DO NOTHING;

-- Domain 6: Goal Orientation
INSERT INTO domains (id, name, description, order_index) VALUES
('d6', 'Goal Orientation', 'Your focus on setting and achieving meaningful objectives.', 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q21', 'd6', 'I set clear and achievable goals.', 'LIKERT', 'BOTH', 1),
('q22', 'd6', 'I stay focused on my objectives.', 'LIKERT', 'BOTH', 2),
('q23', 'd6', 'I persist in working toward my goals.', 'LIKERT', 'BOTH', 3),
('q24', 'd6', 'I regularly review and adjust my goals as needed.', 'LIKERT', 'BOTH', 4)
ON CONFLICT (id) DO NOTHING;

-- Domain 7: Resilience
INSERT INTO domains (id, name, description, order_index) VALUES
('d7', 'Resilience', 'Your ability to bounce back from setbacks and maintain performance.', 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q25', 'd7', 'I bounce back quickly from disappointments.', 'LIKERT', 'BOTH', 1),
('q26', 'd7', 'I maintain performance during challenging times.', 'LIKERT', 'BOTH', 2),
('q27', 'd7', 'I learn from failures and setbacks.', 'LIKERT', 'BOTH', 3),
('q28', 'd7', 'I stay optimistic even when facing difficulties.', 'LIKERT', 'BOTH', 4)
ON CONFLICT (id) DO NOTHING;

-- Domain 8: Communication Skills
INSERT INTO domains (id, name, description, order_index) VALUES
('d8', 'Communication Skills', 'Your effectiveness in expressing ideas and listening to others.', 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q29', 'd8', 'I communicate my ideas clearly.', 'LIKERT', 'BOTH', 1),
('q30', 'd8', 'I listen actively to others.', 'LIKERT', 'BOTH', 2),
('q31', 'd8', 'I adapt my communication style to different audiences.', 'LIKERT', 'BOTH', 3),
('q32', 'd8', 'I ask thoughtful questions to understand others better.', 'LIKERT', 'BOTH', 4)
ON CONFLICT (id) DO NOTHING;

-- Domain 9: Relationship Building
INSERT INTO domains (id, name, description, order_index) VALUES
('d9', 'Relationship Building', 'Your ability to develop and maintain positive working relationships.', 9)
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q33', 'd9', 'I build rapport easily with others.', 'LIKERT', 'BOTH', 1),
('q34', 'd9', 'I maintain positive relationships even during conflicts.', 'LIKERT', 'BOTH', 2),
('q35', 'd9', 'I show genuine interest in others.', 'LIKERT', 'BOTH', 3),
('q36', 'd9', 'I create an inclusive environment for team members.', 'LIKERT', 'BOTH', 4)
ON CONFLICT (id) DO NOTHING;

-- Domain 10: Accountability
INSERT INTO domains (id, name, description, order_index) VALUES
('d10', 'Accountability', 'Your willingness to take ownership of your actions and commitments.', 10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q37', 'd10', 'I take responsibility for my actions.', 'LIKERT', 'BOTH', 1),
('q38', 'd10', 'I follow through on my commitments.', 'LIKERT', 'BOTH', 2),
('q39', 'd10', 'I admit when I make mistakes.', 'LIKERT', 'BOTH', 3),
('q40', 'd10', 'I hold myself to high standards.', 'LIKERT', 'BOTH', 4)
ON CONFLICT (id) DO NOTHING;

-- Domain 11: Growth Mindset
INSERT INTO domains (id, name, description, order_index) VALUES
('d11', 'Growth Mindset', 'Your belief that abilities can be developed through dedication and hard work.', 11)
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q41', 'd11', 'I believe I can improve my abilities through effort.', 'LIKERT', 'BOTH', 1),
('q42', 'd11', 'I view challenges as opportunities to grow.', 'LIKERT', 'BOTH', 2),
('q43', 'd11', 'I see effort as a path to mastery.', 'LIKERT', 'BOTH', 3),
('q44', 'd11', 'I embrace the learning process, even when it is difficult.', 'LIKERT', 'BOTH', 4)
ON CONFLICT (id) DO NOTHING;

-- Domain 12: Action Orientation
INSERT INTO domains (id, name, description, order_index) VALUES
('d12', 'Action Orientation', 'Your tendency to take initiative and follow through on commitments.', 12)
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q45', 'd12', 'I take initiative to get things done.', 'LIKERT', 'BOTH', 1),
('q46', 'd12', 'I act decisively when needed.', 'LIKERT', 'BOTH', 2),
('q47', 'd12', 'I follow through on my plans.', 'LIKERT', 'BOTH', 3),
('q48', 'd12', 'I proactively address problems before they escalate.', 'LIKERT', 'BOTH', 4)
ON CONFLICT (id) DO NOTHING;

-- Verification query (run after to confirm)
-- SELECT 'Domains:' as type, COUNT(*) as count FROM domains
-- UNION ALL
-- SELECT 'Questions:' as type, COUNT(*) as count FROM questions;
