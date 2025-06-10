import React, { useState } from 'react';

interface Comment {
  id: string;
  user: string;
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  projectId: string;
  comments: Comment[];
}

export default function CommentSection({ projectId, comments }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement comment submission logic
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold mb-4">Comments</h3>
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Add a comment..."
        ></textarea>
        <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
          Post Comment
        </button>
      </form>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-100 p-4 rounded">
            <p className="font-semibold">{comment.user}</p>
            <p>{comment.content}</p>
            <p className="text-sm text-gray-500">{comment.createdAt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}