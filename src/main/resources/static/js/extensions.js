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
    s = s.trim().toLowerCase();
    if (s.startsWith(".")) s = s.slice(1);
    return s;
}

async function reloadTags() {
    // 화면 전체 리렌더 대신, 목록만 다시 그릴 수도 있지만 과제는 단순하니 재조회가 안전
    const data = await api("/api/extensions");
    const tags = document.getElementById("customTags");
    const count = document.getElementById("countText");
    tags.innerHTML = "";
    data.custom.forEach(ext => {
        const tag = document.createElement("div");
        tag.className = "tag";
        tag.innerHTML = `<span>${ext}</span><button class="x" type="button" data-ext="${ext}">X</button>`;
        tags.appendChild(tag);
    });
    count.textContent = `${data.custom.length}/200`;
    document.getElementById("addBtn").disabled = data.custom.length >= 200;
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
        const input = document.getElementById("customInput");
        const ext = normalizeExt(input.value);
        if (!ext) return alert("확장자를 입력하세요.");
        if (ext.length > 20) return alert("확장자는 최대 20자입니다.");

        try {
            await api("/api/extensions/custom", {
                method: "POST",
                body: JSON.stringify({ ext })
            });
            input.value = "";
            await reloadTags();
        } catch (err) {
            alert(err.message);
        }
    }

    if (el.matches("button.x[data-ext]")) {
        const ext = el.getAttribute("data-ext");
        try {
            await api(`/api/extensions/custom/${encodeURIComponent(ext)}`, { method: "DELETE" });
            await reloadTags();
        } catch (err) {
            alert(err.message);
        }
    }
});

document.getElementById("customInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("addBtn").click();
});
