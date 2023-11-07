

const Navbar = () => {
  return (
    <nav className="py-4">
      <div className="px-8 flex items-center justify-between">
        <div className="searchbox basis-4/5 relative">
            <span className="bi-search absolute top-2 left-2"></span>
            <input
                type="search"
                name="search"
                id="search" 
                className="border-none outline-none rounded-lg w-4/5 bg-gray-50 px-8 py-2"
                placeholder="Search here..."
            />
        </div>
        <ul className="flex items-center gap-4">
            <li className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-black">
                <span className="bi-bell"></span>
            </li>
            <li>
                <span className="bi-person"></span>
            </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
