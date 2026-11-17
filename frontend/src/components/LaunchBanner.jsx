import { Link } from "react-router";

export default function LaunchBanner() {
  return (
    <section
      id="launch"
      className="bg-primary text-on-primary rounded-DEFAULT p-6 sm:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden shadow-lg"
    >
      <div className="flex flex-col gap-2 max-w-xl">
        <span className="text-label-sm text-primary-fixed uppercase tracking-wider font-bold">
          Start Today For Free
        </span>
        <h3 className="text-headline-lg sm:text-[32px] sm:leading-[38px] text-on-primary font-extrabold leading-tight">
          Ready to turn WhatsApp chats into closed sales?
        </h3>
        <p className="text-body-md sm:text-[16px] text-primary-fixed-dim mt-1">
          Join thousands of Nigerian merchants closing 3x more deals weekly with zero back-and-forth
          headache.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:min-w-[240px]">
        <Link
          to="/signup"
          className="w-full bg-surface text-on-surface text-headline-sm py-4 px-8 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] hover:bg-white transition-all cursor-pointer font-bold shadow-md"
        >
          <span>Create My Free Kiosq</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </Link>

        {/* Hand-Drawn Doodle Note */}
        <div className="flex items-center justify-center gap-1.5 pt-1 text-primary-fixed">
          <span className="material-symbols-outlined text-[16px]">bolt</span>
          <span className="text-label-sm">No credit card or setup fee required</span>
        </div>
      </div>
    </section>
  );
}
