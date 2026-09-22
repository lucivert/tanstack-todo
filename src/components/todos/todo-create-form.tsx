import { useState } from 'react'

type TodoCreateFormProps = {
  onCreate: (description: string) => Promise<void>
}

export function TodoCreateForm({ onCreate }: TodoCreateFormProps) {
  const [description, setDescription] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <section className="panel">
      <form
        className="create-form"
        onSubmit={async (event) => {
          event.preventDefault()
          setErrorMessage(null)
          setIsSubmitting(true)

          try {
            await onCreate(description)
            setDescription('')
          } catch (error) {
            setErrorMessage(
              error instanceof Error ? error.message : 'Failed to create todo.',
            )
          } finally {
            setIsSubmitting(false)
          }
        }}
      >
        <label className="field field-grow">
          <span>New todo</span>
          <input
            aria-label="New todo description"
            className="input"
            name="description"
            placeholder="What needs to get done?"
            type="text"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value)
            }}
          />
        </label>

        <button className="button button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Adding…' : 'Add todo'}
        </button>
      </form>

      {errorMessage ? (
        <p className="error-message" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </section>
  )
}
