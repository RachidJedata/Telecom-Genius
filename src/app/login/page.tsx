'use client'

import Link from "next/link"
import { Button } from "../ui/components/button"
import { Input } from "../ui/components/input"
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useSearchParams } from 'next/navigation';
import GithubButton from "../ui/components/signGithub";
import GoogleButton from "../ui/components/signGoogle";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDisabled(true);
    setErrorMessage("");
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        setErrorMessage("Invalid email or password");
      } else {
        const callbackUrl = searchParams.get('callbackUrl') || '/';
        router.push(callbackUrl);
        router.refresh();
        // Force a full page reload after successful login
        // window.location.reload();
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsDisabled(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center -mt-7 justify-center dark:bg-gray-500 bg-accent">
      <div className="w-full max-w-md">
        <div className="bg-white  dark:bg-gray-900 rounded-2xl shadow-lg px-8 pt-5 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-normal text-primary">Sign In</h1>
            <p className="text-base dark:text-primary/80 text-semiGray">pour continuer vers la plateforme</p>
          </div>

          {errorMessage && <p className="bg-red-400 text-accent py-2 rounded-lg pl-3 text-sm mb-4">{errorMessage}</p>}

          <div className="flex gap-2">
            <GoogleButton />
            <GithubButton />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 dark:bg-gray-300 bg-white text-semiGgray">Or</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value) }}
                required
                disabled={isDisabled}
                placeholder="Entrez votre e-mail"
                className="h-12 px-4 text-base border-2 rounded-md border-[#e2e8f0] focus:border-primary focus:ring-4 focus:ring-accent"
              />
            </div>

            <div>
              <Input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value) }}
                required
                disabled={isDisabled}
                placeholder="Créez un mot de passe"
                className="h-12 px-4 text-base border-2 rounded-md border-[#e2e8f0] focus:border-primary focus:ring-4 focus:ring-accent"
              />
            </div>

            <div className="pt-2">
              <Button disabled={isDisabled} type="submit" className="w-full h-12 bg-primary hover:bg-[#a070e0] text-white">
                {isDisabled ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>


          <div className="mt-3 pb-2 text-center">
            <p className="dark:text-gray-400 text-semiGgray">
              Vous n'avez pas de compte ?{" "}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
        <div className="h-2 rounded-2xl z-10 bg-gradient-to-r from-primary to-accent"></div>
      </div>
    </div>
  )
}

