export function flyToCart(from: DOMRect) {
  if (typeof window === "undefined") return
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  const target = document.getElementById("cart-target")?.getBoundingClientRect()
  if (!target) return

  const dot = document.createElement("span")
  dot.setAttribute("aria-hidden", "true")
  dot.style.position = "fixed"
  dot.style.zIndex = "80"
  dot.style.left = `${from.left + from.width / 2 - 6}px`
  dot.style.top = `${from.top + from.height / 2 - 6}px`
  dot.style.width = "12px"
  dot.style.height = "12px"
  dot.style.borderRadius = "999px"
  dot.style.background = "#ffe500"
  dot.style.boxShadow = "0 6px 16px rgba(0,0,0,0.18)"
  dot.style.pointerEvents = "none"
  document.body.appendChild(dot)

  const dx = target.left + target.width / 2 - (from.left + from.width / 2)
  const dy = target.top + target.height / 2 - (from.top + from.height / 2)
  const animation = dot.animate(
    [
      { transform: "translate(0px, 0px) scale(1)", opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.35)`, opacity: 0.15 },
    ],
    { duration: 560, easing: "cubic-bezier(.22,.8,.24,1)", fill: "forwards" },
  )
  animation.onfinish = () => dot.remove()
}
