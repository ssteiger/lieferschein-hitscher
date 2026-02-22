import { useMutation } from '@tanstack/react-query'
import { Fingerprint, LoaderCircle } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'

import { Button } from '~/lib/components/ui/button'
import { Input } from '~/lib/components/ui/input'
import { Label } from '~/lib/components/ui/label'
import { cn } from '~/lib/utils/cn'
import { authClient } from '~/lib/auth-client'

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>

export function UserAuthFormLogin({ className, ...props }: UserAuthFormProps) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const router = useRouter()

  const loginMutation = useMutation({
    mutationFn: async (variables: { email: string; password: string }) => {
      const { data, error } = await authClient.signIn.email({
        email: variables.email,
        password: variables.password,
      })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      toast.success('Login successful')
      router.navigate({ to: '/' })
    },
    onError: (error) => {
      toast.error(`Login failed: ${error.message}`)
    },
  })

  const passkeyMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.signIn.passkey()
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      toast.success('Login successful')
      router.navigate({ to: '/' })
    },
    onError: (error) => {
      toast.error(`Passkey login failed: ${error.message}`)
    },
  })

  const isLoading = loginMutation.isPending || passkeyMutation.isPending

  const error = loginMutation.error?.message || passkeyMutation.error?.message || null

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    loginMutation.mutate({ email, password })
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">{error}</div>}

      <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email webauthn"
              autoCorrect="off"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              placeholder="Password"
              type="password"
              autoComplete="current-password webauthn"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button disabled={isLoading} type="submit">
            {loginMutation.isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={() => passkeyMutation.mutate()}
      >
        {passkeyMutation.isPending ? (
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Fingerprint className="mr-2 h-4 w-4" />
        )}{' '}
        Sign in with Passkey
      </Button>
    </div>
  )
}
