import { Button } from "@/lib/components/ui/button";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { apps } from "@/lib/constants/toys";
import { GITHUB_URL } from "@/lib/constants/urls";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-16 flex flex-col items-center text-center">
          <div className="relative mb-6 h-32 w-32 overflow-hidden rounded-full">
            <Image
              src="/avatar.jpeg"
              alt="Suica's Avatar"
              fill
              className="object-cover"
              priority
            />
          </div>
          <h1 className="mb-4 text-4xl font-bold">Suica&apos;s Toy Box</h1>
          <p className="mb-8 max-w-2xl text-lg text-gray-600">
            A collection of simple yet useful tools for daily use. All tools run
            entirely in your browser or use lightweight serverless functions -
            no data is stored on any servers.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href={GITHUB_URL} target="_blank">
                <Image
                  src="/icon/github.svg"
                  alt="GitHub"
                  width={20}
                  height={20}
                />
                View Source
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <Link
              key={app.title}
              href={app.href}
              className="group block rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-lg p-2">
                  <app.icon className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h2 className="group-hover:text-primary mb-2 text-xl font-semibold transition-colors">
                    {app.title}
                    <ExternalLink className="ml-2 inline h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </h2>
                  <p className="text-gray-600">{app.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mx-auto max-w-2xl text-center text-gray-600">
          <h2 className="mb-4 text-2xl font-semibold">Privacy First</h2>
          <p className="mb-4">
            All tools in Suica&apos;s Toy Box run entirely in your browser. We
            don&apos;t store any data, don&apos;t use cookies, and don&apos;t
            track your usage.
          </p>
          <p>
            The entire source code is available on{" "}
            <Link
              href={GITHUB_URL}
              className="text-primary hover:underline"
              target="_blank"
            >
              GitHub
            </Link>{" "}
            for transparency and verification.
          </p>
        </div>
      </div>
    </main>
  );
}
