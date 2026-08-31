"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const [cursorOn, setCursorOn] = useState(true);

  useEffect(() => {
    const blink = setInterval(
      () => setCursorOn((c) => !c),
      500
    );

    return () => clearInterval(blink);
  }, []);

  useEffect(() => {
    const goHome = () => router.push("/");

    window.addEventListener("keydown", goHome);
    window.addEventListener("click", goHome);

    return () => {
      window.removeEventListener("keydown", goHome);
      window.removeEventListener("click", goHome);
    };
  }, [router]);

  return (
    <main className="bsod">
      <div className="bsod-body">
        <p className="bsod-title">Windows</p>

        <p>
          A fatal exception 0E has occurred at
          0028:C0011E36 in VXD VMM(01) +
          00010E36. The current page could not
          be found and has been terminated.
        </p>

        <p>
          * Press any key to return to
          MaxOS.exe
        </p>
        <p>
          * Press CTRL+ALT+DEL again to warm
          reboot the desktop. You will lose
          any unsaved kind words.
        </p>

        <p className="bsod-cursor-line">
          Press any key to continue{" "}
          <span
            className={
              cursorOn
                ? "bsod-cursor on"
                : "bsod-cursor"
            }
          >
            _
          </span>
        </p>
      </div>
    </main>
  );
}
