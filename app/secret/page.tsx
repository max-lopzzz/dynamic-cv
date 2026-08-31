import type { Metadata } from "next";
import Link from "next/link";
import { CRTScreen } from "../components/CRTScreen";

export const metadata: Metadata = {
  title: "you found it — Maximiliano López Montaño",
  robots: "noindex, nofollow",
};

const SANDWICH = [
  "     ___________     ",
  "    /###########\\    ",
  "   /#############\\   ",
  "  |...............|  ",
  "  |  L E T T U C E |  ",
  "  |...............|  ",
  "  | T O M A T O E S|  ",
  "  |_______________|  ",
  "   \\#############/   ",
  "    \\###########/    ",
];

export default function SecretPage() {
  return (
    <CRTScreen intensity="strong">
      <main className="secret-page">
        <div className="secret-window">
          <div className="titlebar">
            <span>you_found_it.exe</span>
          </div>

          <div className="secret-body">
            <pre className="secret-sandwich">
              {SANDWICH.join("\n")}
            </pre>

            <p className="secret-title">
              congrats, you actually typed
              &ldquo;sudo make me a
              sandwich&rdquo; into a
              stranger&apos;s portfolio
              terminal.
            </p>

            <p>
              there&apos;s no real prize
              here — just the sandwich, and
              the fact that you&apos;re the
              kind of person who tries
              weird commands. that&apos;s a
              good quality in an engineer.
            </p>

            <p className="secret-note">
              (an achievement should have
              quietly unlocked back on the
              desktop, too.)
            </p>

            <Link href="/" className="bevel">
              ← back to the desktop
            </Link>
          </div>
        </div>
      </main>
    </CRTScreen>
  );
}
