import { Button } from "@/components/ui/button";
import { ExternalLink, Languages } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const apps = [
  {
    title: "Translator",
    description: "A Google Translate-like interface r quick translations",
    icon: Languages,
    href: "/translate",
  },
]
const GITHUB_URL = "https://github.com/SuicaLondon/suica-no-toy-box";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="relative w-32 h-32 mb-6 rounded-full overflow-hidden">
            <Image
              src="/avatar.jpeg"
              alt="Suica's Avatar"
              fill
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold mb-4">Suica&apos;s Toy Box</h1>
          <p className="text-lg text-gray-600 max-w-2xl mb-8">
            A collection of simple yet useful tools for daily use. All tools run entirely in your browser or use lightweight serverless functions -
            no data is stored on any servers.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href={GITHUB_URL} target="_blank">
                <Image src="/icon/github.svg" alt="GitHub" width={20} height={20} />
                View Source
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {apps.map((app) => (
            <Link
              key={app.title}
              href={app.href}
              className="group block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <app.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {app.title}
                    <ExternalLink className="w-4 h-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h2>
                  <p className="text-gray-600">{app.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center text-gray-600 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Privacy First</h2>
          <p className="mb-4">
            All tools in Suica&apos;s Toy Box run entirely in your browser.
            We don&apos;t store any data, don&apos;t use cookies, and don&apos;t track your usage.
          </p>
          <p>
            The entire source code is available on{" "}
            <Link
              href={GITHUB_URL}
              className="text-primary hover:underline"
              target="_blank"
            >
              GitHub
            </Link>
            {" "}for transparency and verification.
          </p>
        </div>
      </div>
    </main>
  );
}
