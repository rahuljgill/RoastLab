function Navbar() {
  return (
    <nav className="navbar fixed top-0 left-0 w-full z-50 opacity-0 -translate-y-8 backdrop-blur-md bg-black/40">
      <div className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight">
          Roast<span className="text-brand">Lab</span>
        </h1>

        <div className="space-x-6 hidden md:flex text-sm font-medium">
          <a href="#" className="hover:text-brand transition">
            Shop
          </a>
          <a href="#" className="hover:text-brand transition">
            Build Your Blend
          </a>
          <a href="#" className="hover:text-brand transition">
            Login
          </a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
