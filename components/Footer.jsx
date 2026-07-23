"use client";

export default function Footer() {
  return (
    <footer className='px-6 pb-10 pt-6'>
      <div className='max-w-6xl mx-auto glass rounded-2xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3'>
        <div className='flex items-center gap-2 text-fg-muted text-sm'>
          <div className='w-6 h-6 rounded-lg bg-accent-grad' />
          <span className='text-fg-muted'>
            Lumen · Crafted with liquid glass
          </span>
        </div>
        <div className='text-xs text-fg-subtle'>
          © {new Date().getFullYear()} Lumen Bookings
        </div>
      </div>
    </footer>
  );
}
