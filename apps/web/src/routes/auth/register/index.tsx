import { createFileRoute, Link } from '@tanstack/react-router'
import { buttonVariants } from '~/lib/components/ui/button'
import { cn } from '~/lib/utils/cn'
import { UserAuthFormRegister } from './-components/user-auth-form'

const RegistgerPage = () => {
  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center lg:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        to="/auth/login"
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-4 top-4 md:right-8 md:top-8',
        )}
      >
        Login
      </Link>
      <div className="relative hidden h-full overflow-hidden lg:block">
        <img
          src="/hitscher_mitarbeiter.png"
          alt="Hitscher Mitarbeiter"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex justify-center">
            <img src="/hitscher_logo.png" alt="Gartenbau Hitscher" className="h-80 w-auto" />
          </div>
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create Account</h1>
            <p className="text-sm text-muted-foreground">
              Create your account and optionally register a passkey.
            </p>
          </div>
          <div className="px-8 md:px-0">
            <UserAuthFormRegister />
          </div>
          <p className="px-8 text-sm text-center text-muted-foreground">
            By clicking continue, you agree to our{' '}
            <Link to="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/auth/register/')({
  component: RegistgerPage,
  loader: ({ context }) => {
    return { user: context.user }
  },
})
