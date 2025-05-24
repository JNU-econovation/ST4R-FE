import SearchBar from '../components/common/SearchBar';

export default function Header() {
  return (
    <header className="bg-black text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">ST4R</div>
          <div className="w-2/3">
            <SearchBar />
          </div>
          {/* 기타 헤더 요소들 */}
        </div>
      </div>
    </header>
  );
}
