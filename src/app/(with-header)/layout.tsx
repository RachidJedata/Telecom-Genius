import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import SignOutButton from "@/app/components/signOut";
import Footer from "@/app/components/footer";
import { AiChatButton } from "@/app/components/ai-chat-button";
import { authOptions } from "../lib/auth";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  console.log(session?.user?.image);
  return (
    <>
      <div className="min-h-screen">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80  dark:bg-gray-900 backdrop-blur-md border-b">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              href='/'
              className="flex items-center gap-2">
              <Image
                width={20}
                height={20}
                src={`${process.env.NEXTAUTH_URL || ''}/logo.png`}
                alt="Global Communications"
                className="h-8 w-8 text-primary"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                TelecomGenius
              </span>
            </Link>
            {(session?.user) && (
              <div className="relative group">
                {/* Image */}
                <Image
                  alt="user picture"
                  src={`${process.env.NEXTAUTH_URL || ''}${session.user.image!}`}
                  width={40}
                  height={40}
                  className="rounded-full bg-accent relative cursor-pointer"
                />

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-12 w-40 bg-white  dark:bg-gray-950 shadow-lg rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <ul>
                    <li className="p-2 hover:bg-gray-100 dark:hover:bg-semiGgray">
                      <Link href={'/courses'}>Courses</Link>
                    </li>
                    <li className="p-2 hover:bg-gray-100 dark:hover:bg-semiGgray">
                      <Link href={'/profile'}>Profile</Link>
                    </li>
                    <li className="p-2 hover:bg-gray-100 dark:hover:bg-semiGgray">
                      <SignOutButton />
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </nav>


        {/* Add padding to account for fixed navbar */}
        <div className="pt-16">
          {children}
        </div>
      </div>

      <Footer />
      {(session?.user) && (<AiChatButton />)}
    </>
  );
}
