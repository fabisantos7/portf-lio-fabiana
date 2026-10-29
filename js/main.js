/* ==========================================================================
   FABIANA SANTOS · MARÉ — js/main.js
   ========================================================================== */
(function () {
  "use strict";
  var raiz = document.documentElement;
  var reduzido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fino = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  var EMAIL = "fabianasantosaguiarsilva3107@gmail.com";

  /* 1 · Menu mobile */
  var nav = document.querySelector(".nav-fixa");
  var bt = document.querySelector(".nav-toggle");
  if (nav && bt) {
    bt.addEventListener("click", function () {
      var aberto = nav.classList.toggle("aberto");
      bt.setAttribute("aria-expanded", aberto ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target instanceof Element && e.target.closest(".menu a")) {
        nav.classList.remove("aberto");
        bt.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* 2 · Upload de fotos */
  document.querySelectorAll(".photo input").forEach(function (inp) {
    inp.addEventListener("change", function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        var box = inp.closest(".photo") || inp.parentElement;
        var alvo = box.querySelector(".foto-inner") || box;
        var antiga = alvo.querySelector("img");
        if (antiga) antiga.remove();
        var img = document.createElement("img");
        img.src = String(r.result);
        img.alt = "Foto escolhida";
        alvo.appendChild(img);
      };
      r.readAsDataURL(f);
    });
  });

  /* 3 · Revelação + cascata */
  function mostrar(el) { el.classList.add("in"); }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) { mostrar(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
    document.querySelectorAll("[data-stagger]").forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (f, i) {
        f.style.transitionDelay = (i * 80) + "ms";
        io.observe(f);
      });
    });
  } else {
    document.querySelectorAll(".reveal,[data-stagger]").forEach(mostrar);
    document.querySelectorAll("[data-stagger]").forEach(function (g) {
      Array.prototype.forEach.call(g.children, mostrar);
    });
  }

  /* 4 · Partículas (bolhas) + explosões */
  var particulas = (function () {
    if (reduzido) return { explosao: function () {} };
    try {
      var cv = document.createElement("canvas");
      cv.id = "particulas";
      cv.setAttribute("aria-hidden", "true");
      cv.style.cssText = "position:fixed;inset:0;z-index:1;pointer-events:none";
      document.body.appendChild(cv);
      var ctx = cv.getContext("2d");
      var dpr = Math.min(devicePixelRatio || 1, 2), W = 0, H = 0, ps = [];
      function redim() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
      redim(); addEventListener("resize", redim);
      var cores = ["57,214,255", "124,245,212", "139,124,255"];
      var n = Math.max(18, Math.min(46, Math.round(W * H / 36000)));
      for (var i = 0; i < n; i++) {
        var bolha = Math.random() < .55;
        ps.push({ t: bolha ? "b" : "m", x: Math.random() * W, y: Math.random() * H,
          r: bolha ? 1.4 + Math.random() * 3 : .8 + Math.random() * 1.5,
          vy: bolha ? -(.14 + Math.random() * .3) : -(.02 + Math.random() * .08),
          wob: Math.random() * 6.3, a: .1 + Math.random() * .18,
          cor: cores[i % 3] });
      }
      function explosao(x, y, qtd) {
        qtd = qtd || 26;
        for (var i = 0; i < qtd; i++) {
          var a = Math.random() * 6.3, v = 1.8 + Math.random() * 4.5;
          ps.push({ t: "f", x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.6,
            g: .05, r: 1.2 + Math.random() * 2.8, vida: 1, decai: .012 + Math.random() * .01,
            cor: cores[i % 3] });
        }
      }
      var T = 0, raf = 0;
      function passo() {
        T++; ctx.clearRect(0, 0, W, H);
        for (var i = ps.length - 1; i >= 0; i--) {
          var p = ps[i];
          if (p.t === "f") {
            p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= .985; p.vida -= p.decai;
            if (p.vida <= 0) { ps.splice(i, 1); continue; }
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.3);
            ctx.fillStyle = "rgba(" + p.cor + "," + p.vida.toFixed(2) + ")";
            ctx.shadowColor = "rgba(" + p.cor + ",.85)"; ctx.shadowBlur = 9;
            ctx.fill(); ctx.shadowBlur = 0;
          } else {
            p.x += Math.sin(T * .01 + p.wob) * .25; p.y += p.vy;
            if (p.y < -12) { p.y = H + 12; p.x = Math.random() * W; }
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.3);
            if (p.t === "b") { ctx.strokeStyle = "rgba(124,245,212," + p.a + ")"; ctx.lineWidth = 1; ctx.stroke(); }
            else { ctx.fillStyle = "rgba(" + p.cor + "," + p.a + ")"; ctx.fill(); }
          }
        }
        raf = requestAnimationFrame(passo);
      }
      raf = requestAnimationFrame(passo);
      document.addEventListener("visibilitychange", function () {
        cancelAnimationFrame(raf);
        if (!document.hidden) raf = requestAnimationFrame(passo);
      });
      return { explosao: explosao };
    } catch (e) { return { explosao: function () {} }; }
  })();

  /* 5 · Cursor água-viva 🪼 */
  (function () {
    if (!fino) return;
    try {
      var av = document.createElement("div");
      av.className = "agua-viva";
      av.setAttribute("aria-hidden", "true");
      av.innerHTML =
        '<svg viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg">' +
          '<g class="sino">' +
            '<path d="M20 4 C29 4 33.5 11 33.5 17 C33.5 21.5 28 24 20 24 C12 24 6.5 21.5 6.5 17 C6.5 11 11 4 20 4 Z" fill="rgba(57,214,255,.28)" stroke="#9beef7" stroke-width="1.6"/>' +
            '<ellipse cx="20" cy="15" rx="7" ry="4.5" fill="rgba(124,245,212,.35)"/>' +
            '<path d="M9 22.5 Q20 27 31 22.5" fill="none" stroke="#7CF5D4" stroke-width="1" opacity=".8"/>' +
          '</g>' +
          '<g class="tentaculos" fill="none" stroke="#9beef7" stroke-width="1.3" stroke-linecap="round" opacity=".85">' +
            '<path d="M12 25 q-2.5 6 1 12 q2 4 -1 8"/>' +
            '<path d="M17.5 26 q2 7 -1.5 13 q-1.5 4 1 8"/>' +
            '<path d="M23 26 q-2 7 1.5 13 q1.5 4 -1 8"/>' +
            '<path d="M28.5 25 q3 5.5 .5 11 q-1.5 4 1.5 7"/>' +
          '</g>' +
        '</svg>';
      document.body.appendChild(av);
      document.body.classList.add("cursor-agua-on");
      var x = innerWidth / 2, y = innerHeight / 2, ax = x, ay = y, ang = 0;
      addEventListener("mousemove", function (e) { ax = e.clientX; ay = e.clientY; av.classList.add("on"); }, { passive: true });
      document.documentElement.addEventListener("mouseleave", function () { av.classList.remove("on"); });
      var CLI = "a,button,label,select,.photo", CMP = "input,textarea,[contenteditable]";
      document.addEventListener("mouseover", function (e) {
        if (!(e.target instanceof Element)) return;
        var c = e.target.closest(CLI), m = e.target.closest(CMP);
        av.classList.toggle("brilho", !!c && !m);
        av.classList.toggle("campo", !!m);
      });
      addEventListener("mousedown", function (e) {
        var o = document.createElement("span");
        o.className = "onda-agua";
        o.style.left = e.clientX + "px"; o.style.top = e.clientY + "px";
        document.body.appendChild(o);
        setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); }, 850);
      });
      if (reduzido) {
        addEventListener("mousemove", function (e) {
          av.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
        }, { passive: true });
      } else {
        (function nadar() {
          var dx = ax - x;
          x += dx * .18; y += (ay - y) * .18;
          ang = Math.max(-16, Math.min(16, ang + dx * .5)) * .92;
          av.style.transform = "translate(" + x + "px," + y + "px) rotate(" + ang.toFixed(2) + "deg)";
          requestAnimationFrame(nadar);
        })();
      }
    } catch (err) {
      document.body.classList.remove("cursor-agua-on");
      var v = document.querySelector(".agua-viva");
      if (v && v.parentNode) v.parentNode.removeChild(v);
    }
  })();

  /* 6 · Splash (1ª visita da sessão) + véu de transição */
  var splash = document.querySelector(".splash");
  if (splash && !reduzido) {
    var visto = null;
    try { visto = sessionStorage.getItem("mareVisto"); } catch (e) {}
    if (!visto) {
      try { sessionStorage.setItem("mareVisto", "1"); } catch (e) {}
      raiz.classList.add("sem-rolagem");
      splash.classList.add("on");
      setTimeout(function () {
        splash.classList.remove("on");
        raiz.classList.remove("sem-rolagem");
      }, 1700);
    }
  }
  var veu = document.createElement("div");
  veu.className = "veu";
  veu.setAttribute("aria-hidden", "true");
  document.body.appendChild(veu);
  if (!reduzido) {
    veu.classList.add("on");
    setTimeout(function () { veu.classList.remove("on"); }, 220);
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (!(e.target instanceof Element)) return;
      var a = e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) === "#" || /^(mailto|tel|javascript):/i.test(href)) return;
      if (a.target === "_blank" || /^https?:/i.test(href)) return;
      e.preventDefault();
      veu.classList.add("on");
      setTimeout(function () { window.location.href = href; }, 430);
    });
  }

  /* 7 · HUD: progresso + subir */
  (function () {
    var pb = document.createElement("div");
    pb.className = "progresso"; pb.setAttribute("aria-hidden", "true");
    document.body.appendChild(pb);
    var sb = document.createElement("button");
    sb.className = "subir"; sb.type = "button";
    sb.setAttribute("aria-label", "Voltar ao topo");
    sb.textContent = "↑";
    document.body.appendChild(sb);
    var pend = false;
    function att() {
      var h = document.documentElement.scrollHeight - innerHeight;
      pb.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 0) + "%";
      sb.classList.toggle("visto", scrollY > 550);
      pend = false;
    }
    addEventListener("scroll", function () { if (!pend) { pend = true; requestAnimationFrame(att); } }, { passive: true });
    att();
    sb.addEventListener("click", function () { scrollTo({ top: 0, behavior: reduzido ? "auto" : "smooth" }); });
  })();

  /* 8 · Tilt suave nos cartões */
  if (fino && !reduzido) {
    document.querySelectorAll(".obra, .b-tile, .marco").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - .5;
        var dy = (e.clientY - r.top) / r.height - .5;
        el.style.transform = "perspective(900px) rotateX(" + (-dy * 5).toFixed(2) + "deg) rotateY(" + (dx * 6).toFixed(2) + "deg) translateY(-5px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* 9 · Formulário: sonar + envio */
  var form = document.getElementById("form-contato");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var nome = form.nome.value.trim(), email = form.email.value.trim(), msg = form.mensagem.value.trim();
      var card = form.closest(".form-card");
      var b = form.querySelector('button[type="submit"]');
      var r = b ? b.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
      if (card) card.classList.add("enviando");
      particulas.explosao(r.left + r.width / 2, r.top + r.height / 2, 30);
      var destino = "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent("Contato pelo portfólio — " + nome) +
        "&body=" + encodeURIComponent("Nome: " + nome + "\nE-mail: " + email + "\n\n" + msg);
      setTimeout(function () {
        if (card) card.classList.remove("enviando");
        window.location.href = destino;
      }, 900);
    });
  }

  /* 10 · Ano + easter egg */
  document.querySelectorAll("[data-ano]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  if (!reduzido) {
    document.addEventListener("dblclick", function (e) {
      if (!(e.target instanceof Element)) return;
      if (!e.target.closest(".cta-band, .hero, .rodape")) return;
      particulas.explosao(e.clientX, e.clientY, 30);
      setTimeout(function () { particulas.explosao(e.clientX + (Math.random() - .5) * 160, e.clientY + (Math.random() - .5) * 90, 20); }, 220);
      setTimeout(function () { particulas.explosao(e.clientX + (Math.random() - .5) * 160, e.clientY + (Math.random() - .5) * 90, 20); }, 440);
    });
  }
})();