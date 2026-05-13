export default function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="card border-brand-red/20 bg-brand-red/5 p-4 text-brand-red text-sm">
      ⚠ {msg}
    </div>
  )
}
