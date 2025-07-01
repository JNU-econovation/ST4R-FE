import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useBoardDetail,
  useLikeBoard,
  useComments,
  useCreateComment,
  useLikeComment,
  useCheckEditPermission,
  useDeleteBoard,
} from '../../api/boardDetail';
import BackButton from '../../components/common/BackButton';
import ImageViewer from '../../components/common/ImageViewer';
import BoardDetailMap from '../../components/common/BoardDetailMap';

export default function BoardDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // 현재 로그인한 사용자 정보
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = !!localStorage.getItem('token');

  // API 호출
  const {
    data: post,
    isLoading: isPostLoading,
    error: postError,
  } = useBoardDetail(id);
  const { data: comments, isLoading: isCommentsLoading } = useComments(id);
  const { data: editPermission } = useCheckEditPermission(id);
  const likeBoardMutation = useLikeBoard();
  const createCommentMutation = useCreateComment();
  const likeCommentMutation = useLikeComment();
  const deleteBoardMutation = useDeleteBoard();

  // 작성자인지 확인
  const isAuthor = post && currentUser && post.author?.id === currentUser.id;

  // 이미지 클릭 핸들러
  const handleImageClick = useCallback((index = 0) => {
    setSelectedImageIndex(index);
    setIsImageViewerOpen(true);
  }, []);

  // 뒤로가기
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // 좋아요 처리
  const handleLike = useCallback(() => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    likeBoardMutation.mutate(id);
  }, [isLoggedIn, navigate, likeBoardMutation, id]);

  // 댓글 작성
  const handleCommentSubmit = useCallback(() => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    createCommentMutation.mutate(
      { boardId: id, content: newComment.trim() },
      {
        onSuccess: () => {
          setNewComment('');
        },
      }
    );
  }, [isLoggedIn, navigate, newComment, createCommentMutation, id]);

  // 댓글 좋아요
  const handleCommentLike = useCallback(
    (commentId) => {
      if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }
      likeCommentMutation.mutate({ boardId: id, commentId });
    },
    [isLoggedIn, navigate, likeCommentMutation, id]
  );

  // 게시글 수정
  const handleEdit = useCallback(() => {
    navigate(`/boards/edit/${id}`);
  }, [navigate, id]);

  // 게시글 삭제
  const handleDelete = useCallback(() => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      deleteBoardMutation.mutate(id);
    }
  }, [deleteBoardMutation, id]);

  // 공유하기
  const handleShare = useCallback(() => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다.');
    }
  }, [post]);

  // 북마크 (추후 구현)
  const handleBookmark = useCallback(() => {
    console.log('북마크 기능 - 추후 구현');
    alert('북마크 기능은 추후 구현 예정입니다.');
  }, []);

  // 이미지 뷰어 닫기
  const handleCloseImageViewer = useCallback(() => {
    setIsImageViewerOpen(false);
  }, []);

  // 로딩 상태
  if (isPostLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 에러 상태
  if (postError) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">
            게시글을 불러올 수 없습니다
          </h2>
          <p className="text-gray-400 mb-4">
            {postError?.response?.status === 404
              ? '존재하지 않는 게시글입니다.'
              : '잠시 후 다시 시도해주세요.'}
          </p>
          <button
            onClick={handleBack}
            className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
          >
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const allImages = post.imageUrls || [];

  return (
    <>
      <div className="min-h-screen bg-black text-white">
        {/* 헤더 이미지 영역 */}
        <div className="relative h-80 overflow-hidden">
          {allImages.length > 0 ? (
            <div className="relative group">
              <img
                src={allImages[0]}
                alt={post.title}
                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => handleImageClick(0)}
              />
              {/* 클릭 힌트 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                📷 클릭하여 확대
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
              <svg
                className="w-20 h-20 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />

          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <BackButton className="bg-black/50 backdrop-blur-sm" />

            <div className="flex space-x-2">
              {/* 수정/삭제 버튼 (작성자만) */}
              {isAuthor && (
                <>
                  <button
                    onClick={handleEdit}
                    className="p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={handleDelete}
                    className="p-3 bg-red-500/50 backdrop-blur-sm rounded-full hover:bg-red-500/70 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </>
              )}

              <button
                onClick={handleShare}
                className="p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </button>

              <button
                onClick={handleBookmark}
                className="p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {allImages.length > 1 && (
            <div className="absolute bottom-4 right-4">
              <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
                1 / {allImages.length}
              </div>
            </div>
          )}
        </div>

        {/* 메인 콘텐츠 */}
        <div className="px-4 py-6 -mt-8 relative bg-black rounded-t-3xl">
          {post.category && (
            <div className="mb-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  post.category === 'SPOT'
                    ? 'bg-green-500/20 text-green-400'
                    : post.category === 'PROMOTION'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {post.category === 'SPOT'
                  ? '스팟공유글'
                  : post.category === 'PROMOTION'
                    ? '홍보글'
                    : '자유글'}
              </span>
            </div>
          )}

          <h1 className="text-2xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                {post.author?.profileImage ? (
                  <img
                    src={post.author.profileImage}
                    alt={post.author.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{post.author?.name || '익명'}</p>
                  {/* 작성자 표시 */}
                  {isAuthor && (
                    <span className="bg-yellow-500 text-black px-2 py-0.5 rounded-full text-xs font-medium">
                      작성자
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString('ko-KR')
                    : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{post.likeCount || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span>{post.viewCount?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>{post.commentCount || comments?.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {post.content?.text || post.contentPreview}
            </p>
          </div>

          {/* 추가 이미지들 */}
          {allImages.length > 1 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">추가 이미지</h3>
              <div className="grid grid-cols-1 gap-4">
                {allImages.slice(1).map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`${post.title} - ${index + 2}`}
                      className="w-full rounded-lg object-cover max-h-96 cursor-pointer transition-transform group-hover:scale-[1.02]"
                      onClick={() => handleImageClick(index + 1)}
                    />
                    {/* 호버 오버레이 */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                    <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      클릭하여 확대
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {post.content?.map && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">위치</h3>
              <div className="bg-[#1A1A1A] rounded-xl p-4">
                <BoardDetailMap location={post.content.map} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-800 pt-4 mb-6">
            <button
              onClick={handleLike}
              disabled={likeBoardMutation.isLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                post.isLiked
                  ? 'bg-red-500/20 text-red-500'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              } ${likeBoardMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${!isLoggedIn ? 'opacity-75' : ''}`}
            >
              <svg
                className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>좋아요 {post.likeCount || 0}</span>
              {!isLoggedIn && (
                <span className="text-xs text-gray-500">(로그인 필요)</span>
              )}
            </button>

            <div className="text-gray-400 text-sm">
              댓글 {post.commentCount || comments?.length || 0}개
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              댓글 {comments?.length || 0}개
            </h3>

            {/* 댓글 작성 */}
            {isLoggedIn ? (
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex-shrink-0"></div>
                <div className="flex-1 flex space-x-2">
                  <input
                    type="text"
                    placeholder="댓글을 남겨보세요..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-[#1A1A1A] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    onKeyPress={(e) =>
                      e.key === 'Enter' && handleCommentSubmit()
                    }
                    disabled={createCommentMutation.isLoading}
                  />
                  <button
                    onClick={handleCommentSubmit}
                    disabled={
                      !newComment.trim() || createCommentMutation.isLoading
                    }
                    className="px-4 py-3 bg-yellow-500 text-black rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-400 transition-colors"
                  >
                    {createCommentMutation.isLoading ? '등록중...' : '등록'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#1A1A1A] rounded-lg p-4 text-center">
                <p className="text-gray-400 mb-3">
                  댓글을 작성하려면 로그인이 필요합니다.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
                >
                  로그인하기
                </button>
              </div>
            )}

            <div className="space-y-4">
              {isCommentsLoading ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => {
                  const isCommentAuthor =
                    currentUser && comment.author?.id === currentUser.id;

                  return (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.author?.name || '익명'}
                          </span>
                          {/* 댓글 작성자 표시 */}
                          {isCommentAuthor && (
                            <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                              내 댓글
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {comment.createdAt
                              ? new Date(comment.createdAt).toLocaleString(
                                  'ko-KR'
                                )
                              : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">
                          {comment.content}
                        </p>

                        <div className="flex items-center space-x-4 mt-2">
                          <button
                            onClick={() => handleCommentLike(comment.id)}
                            disabled={!isLoggedIn}
                            className={`text-xs flex items-center space-x-1 transition-colors ${
                              isLoggedIn
                                ? 'text-gray-500 hover:text-gray-300'
                                : 'text-gray-600 cursor-not-allowed'
                            }`}
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                            <span>좋아요 {comment.likeCount || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">첫 번째 댓글을 남겨보세요!</p>
                </div>
              )}
            </div>
          </div>

          <div className="h-20"></div>
        </div>
      </div>

      <ImageViewer
        images={allImages}
        initialIndex={selectedImageIndex}
        isOpen={isImageViewerOpen}
        onClose={handleCloseImageViewer}
      />
    </>
  );
}
