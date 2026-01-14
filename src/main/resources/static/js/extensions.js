async function api(path, options = {}) {
    const res = await fetch(path, {
        headers: { "Content-Type": "application/json" },
        ...options
    });

    if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
            const body = await res.json();
            if (body?.message) msg = body.message;
        } catch (_) {}
        throw new Error(msg);
    }
    return res.status === 204 ? null : res.json().catch(() => null);
}

function normalizeExt(s) {
    if (!s) return "";
    s = s.trim();
    if (s.startsWith(".")) s = s.slice(1);
    return s.toLowerCase();
}

function isLettersOnly(s) {
    return /^[a-zA-Z]+$/.test(s);
}

const customInput = document.getElementById("customInput");
const addBtn = document.getElementById("addBtn");

customInput?.addEventListener("input", () => {
    // '.'는 맨 앞에 한 번만 허용(사용자가 ".sh"처럼 넣는 케이스)
    let v = customInput.value;

    // 영문자와 '.' 외 제거 (붙여넣기/한글 등)
    v = v.replace(/[^a-zA-Z.]/g, ""); // replace 패턴은 흔히 이런 입력 필터에 사용 [web:346]

    // '.'가 여러 개면 첫 글자 '.'만 남기고 제거
    const firstDot = v.indexOf(".");
    if (firstDot > 0) {
        // '.'가 맨 앞이 아닌데 등장하면 제거 (예: "s.h" -> "sh")
        v = v.replaceAll(".", "");
    } else if (firstDot === 0) {
        // 맨 앞 '.'는 남기되 나머지 '.' 제거
        v = "." + v.slice(1).replaceAll(".", "");
    }

    if (v !== customInput.value) customInput.value = v;
});

async function reloadTags() {
    const data = await api("/api/extensions");

    const tags = document.getElementById("customTags");
    const count = document.getElementById("countText");

    tags.innerHTML = "";

    data.custom.forEach(ext => {
        const tag = document.createElement("div");
        tag.className = "tag";

        const span = document.createElement("span");
        span.textContent = ext; // innerHTML 대신 textContent로 안전하게 출력

        const btn = document.createElement("button");
        btn.className = "x";
        btn.type = "button";
        btn.dataset.ext = ext;
        btn.textContent = "X";

        tag.appendChild(span);
        tag.appendChild(btn);
        tags.appendChild(tag);
    });

    count.textContent = `${data.custom.length}/200`;
    addBtn.disabled = data.custom.length >= 200;
}

document.addEventListener("change", async (e) => {
    const el = e.target;
    if (el.matches("input[type=checkbox][data-ext]")) {
        const ext = el.getAttribute("data-ext");
        const next = el.checked;
        try {
            await api(`/api/extensions/fixed/${encodeURIComponent(ext)}`, {
                method: "PUT",
                body: JSON.stringify({ blocked: next })
            });
        } catch (err) {
            alert(err.message);
            el.checked = !next; // rollback
        }
    }
});

document.addEventListener("click", async (e) => {
    const el = e.target;

    if (el.id === "addBtn") {
        const ext = normalizeExt(customInput.value);

        if (!ext) return alert("확장자를 입력하세요.");
        if (ext.length > 20) return alert("확장자는 최대 20자입니다.");
        if (!isLettersOnly(ext)) return alert("커스텀 확장자는 영문자만 입력 가능합니다.");

        try {
            await api("/api/extensions/custom", {
                method: "POST",
                body: JSON.stringify({ ext })
            });
            customInput.value = "";
            await reloadTags();
        } catch (err) {
            // 서버에서: "고정 확장자에 존재" / "이미 존재" 메시지 그대로 표시
            alert(err.message);
        }
    }

    if (el.matches("button.x[data-ext]")) {
        const ext = el.dataset.ext;
        try {
            await api(`/api/extensions/custom/${encodeURIComponent(ext)}`, { method: "DELETE" });
            await reloadTags();
        } catch (err) {
            alert(err.message);
        }
    }
});

customInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addBtn.click();
});

// 최초 렌더 후 동기화(필요 시)
reloadTags().catch(() => {});
