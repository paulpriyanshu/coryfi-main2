export default function RefundHelpCard() {
  return (
    <div className="w-full mx-auto p-6">
      {/* Outer wrapper with subtle gradient ring */}
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-blue-500/50 via-violet-500/50 to-emerald-500/50 dark:from-blue-400/40 dark:via-violet-400/40 dark:to-emerald-400/40 shadow-lg">
        <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-800">
          {/* Header */}
          <div className="px-6 pt-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                {/* Refund/Cancellation icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  <path d="M12 2a8 8 0 1 1-7.446 5.03.75.75 0 0 1 1.392.54A6.5 6.5 0 1 0 12 3.5c-1.73 0-3.312.67-4.49 1.76l1.31 1.31a.75.75 0 1 1-1.06 1.06L5.22 5.09a.75.75 0 0 1 0-1.06L7.76 1.49a.75.75 0 1 1 1.06 1.06L7.51 3.86A7.97 7.97 0 0 1 12 2Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
                  Refunds & Cancellations (Pending Orders)
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  To process a refund or cancel a pending order, please share your order screenshot.
                </p>
              </div>
            </div>
          </div>

          {/* Action area */}
          <div className="px-6 pb-4">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 p-4">
              <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">
                Send the <span className="font-medium">order screenshot</span> (include Order ID, item, and reason) to <span className="font-medium">WhatsApp or call</span> any of the numbers below:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Number 1 */}
                <a
                  href="https://wa.me/918810253985"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/50 bg-white dark:bg-zinc-900 px-4 py-3 hover:shadow-md transition-shadow"
                  aria-label="Contact on WhatsApp or call +91 8810253985"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {/* WhatsApp icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M12.04 2a9.9 9.9 0 0 0-8.45 14.9L2 22l5.25-1.55A9.93 9.93 0 1 0 12.04 2Zm5.9 14.56c-.25.7-1.46 1.3-2.02 1.31-.53.01-1.2.18-4.02-1.32-3.4-1.8-5.6-5.98-5.77-6.26-.16-.28-1.37-1.82-1.37-3.47 0-1.66.86-2.48 1.17-2.82.31-.35.68-.43.9-.43h.65c.21 0 .5-.08.76.57.26.66.89 2.28.97 2.45.08.17.13.37.02.59-.11.22-.17.36-.34.56-.17.2-.35.45-.51.61-.17.17-.35.35-.15.7.2.35.89 1.47 1.9 2.38 1.31 1.17 2.42 1.53 2.77 1.69.35.17.55.14.76-.08.22-.22.88-1.02 1.12-1.37.24-.35.47-.29.78-.17.31.12 2 1 2.34 1.18.34.18.56.27.64.42.08.16.08.9-.16 1.6Z"/>
                      </svg>
                    </span>
                    <div className="leading-tight">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">+91 8810253985</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Tap to WhatsApp · Long press to copy</p>
                    </div>
                  </div>
                  <a href="tel:+918810253985" className="text-xs px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    Call
                  </a>
                </a>

                {/* Number 2 */}
                <a
                  href="https://wa.me/918448157490"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/50 bg-white dark:bg-zinc-900 px-4 py-3 hover:shadow-md transition-shadow"
                  aria-label="Contact on WhatsApp or call +91 8448157490"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {/* WhatsApp icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M12.04 2a9.9 9.9 0 0 0-8.45 14.9L2 22l5.25-1.55A9.93 9.93 0 1 0 12.04 2Zm5.9 14.56c-.25.7-1.46 1.3-2.02 1.31-.53.01-1.2.18-4.02-1.32-3.4-1.8-5.6-5.98-5.77-6.26-.16-.28-1.37-1.82-1.37-3.47 0-1.66.86-2.48 1.17-2.82.31-.35.68-.43.9-.43h.65c.21 0 .5-.08.76.57.26.66.89 2.28.97 2.45.08.17.13.37.02.59-.11.22-.17.36-.34.56-.17.2-.35.45-.51.61-.17.17-.35.35-.15.7.2.35.89 1.47 1.9 2.38 1.31 1.17 2.42 1.53 2.77 1.69.35.17.55.14.76-.08.22-.22.88-1.02 1.12-1.37.24-.35.47-.29.78-.17.31.12 2 1 2.34 1.18.34.18.56.27.64.42.08.16.08.9-.16 1.6Z"/>
                      </svg>
                    </span>
                    <div className="leading-tight">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">+91 8448157490</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Tap to WhatsApp · Long press to copy</p>
                    </div>
                  </div>
                  <a href="tel:+918448157490" className="text-xs px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    Call
                  </a>
                </a>
              </div>

              {/* Quick tips */}
              <ul className="mt-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-2">
                  <span className="mt-0.5">•</span>
                  Share a clear <span className="font-medium">screenshot of the order page</span> showing the Order ID and payment status.
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5">•</span>
                  Cancellations are accepted for <span className="font-medium">pending / not yet dispatched</span> orders only.
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5">•</span>
                  For faster help, include a short note like: “Cancel order — mistaken item / duplicate order”.
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                Tip: If WhatsApp isn’t working, try calling. We’ll get back as soon as possible.
              </p>
              <div className="text-[10px] tracking-wide uppercase text-zinc-400 dark:text-zinc-500">
                Support • Secure • Hassle‑Free
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
