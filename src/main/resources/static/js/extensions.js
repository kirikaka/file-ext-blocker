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

// (선택) 고정 추가 입력이 있는 경우만
const fixedInput = document.getElementById("fixedInput");
const addFixedBtn = document.getElementById("addFixedBtn");

// 커스텀 입력: 영문자 + '.'만 남기고 필터
customInput?.addEventListener("input", () => {
    let v = customInput.value;
    v = v.replace(/[^a-zA-Z.]/g, "");

    const firstDot = v.indexOf(".");
    if (firstDot > 0) v = v.replaceAll(".", "");
    else if (firstDot === 0) v = "." + v.slice(1).replaceAll(".", "");

    if (v !== customInput.value) customInput.value = v;
});

// (선택) 고정 입력도 영문자만 필터
fixedInput?.addEventListener("input", () => {
    fixedInput.value = fixedInput.value.replace(/[^a-zA-Z.]/g, "");
});

function renderFixed(fixedList) {
    const fixedArea = document.getElementById("fixedArea");
    fixedArea.innerHTML = "";

    fixedList.forEach(fx => {
        const row = document.createElement("div");
        row.className = "fixed-item";

        const label = document.createElement("label");
        label.className = "fixed-label";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = !!fx.blocked;
        cb.dataset.ext = fx.ext;
        cb.dataset.kind = "fixed-toggle";

        const span = document.createElement("span");
        span.textContent = fx.ext;

        // 고정 삭제 X 버튼(원하면)
        const del = document.createElement("button");
        del.type = "button";
        del.className = "x";
        del.textContent = "X";
        del.dataset.ext = fx.ext;
        del.dataset.kind = "fixed-delete";

        label.appendChild(cb);
        label.appendChild(span);
        row.appendChild(label);
        row.appendChild(del);

        fixedArea.appendChild(row);
    });
}


function renderCustom(customList) {
    const tags = document.getElementById("customTags");
    const count = document.getElementById("countText");
    if (!tags || !count) return;

    tags.innerHTML = "";

    customList.forEach(ext => {
        const tag = document.createElement("div");
        tag.className = "tag";

        const span = document.createElement("span");
        span.textContent = ext;

        const promote = document.createElement("button");
        promote.className = "promote";
        promote.type = "button";
        promote.dataset.ext = ext;
        promote.dataset.kind = "custom-promote";
        promote.textContent = "고정";

        const del = document.createElement("button");
        del.className = "x";
        del.type = "button";
        del.dataset.ext = ext;
        del.dataset.kind = "custom-delete";
        del.textContent = "X";

        tag.appendChild(span);
        tag.appendChild(promote);
        tag.appendChild(del);

        tags.appendChild(tag);
    });

    count.textContent = `${customList.length}/200`;
    addBtn.disabled = customList.length >= 200;
}

async function reloadAll() {
    const data = await api("/api/extensions");
    renderFixed(data.fixed);
    renderCustom(data.custom); // 너가 만든 커스텀 렌더 함수
}

// change: 고정 체크 토글
document.addEventListener("change", async (e) => {
    const el = e.target;

    if (el.matches("input[type=checkbox][data-kind='fixed-toggle']")) {
        const ext = el.dataset.ext;
        const next = el.checked;

        try {
            await api(`/api/extensions/fixed/${encodeURIComponent(ext)}`, {
                method: "PUT",
                body: JSON.stringify({ blocked: next })
            });
        } catch (err) {
            alert(err.message);
            el.checked = !next;
        }
    }
});

// click: 추가/삭제/승격
document.addEventListener("click", async (e) => {
    const el = e.target;

    // 커스텀 추가
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
            await reloadAll();
        } catch (err) {
            alert(err.message);
        }
    }

    // 커스텀 삭제
    if (el.matches("button[data-kind='custom-delete']")) {
        const ext = el.dataset.ext;
        try {
            await api(`/api/extensions/custom/${encodeURIComponent(ext)}`, { method: "DELETE" });
            await reloadAll();
        } catch (err) {
            alert(err.message);
        }
    }

    // 커스텀 -> 고정 승격
    if (el.matches("button.promote[data-kind='custom-promote']")) {
        const ext = el.dataset.ext;
        try {
            await api(`/api/extensions/custom/${encodeURIComponent(ext)}/promote`, { method: "PATCH" });
            await reloadAll(); // 이게 핵심: 고정 섹션까지 갱신
        } catch (err) {
            alert(err.message);
        }
    }

    // 고정 삭제 (X)
    if (el.matches("button[data-kind='fixed-delete']")) {
        const ext = el.dataset.ext;
        if (!confirm(`고정 확장자 '${ext}'를 삭제할까요?`)) return;

        try {
            await api(`/api/extensions/fixed/${encodeURIComponent(ext)}`, { method: "DELETE" });
            await reloadAll();
        } catch (err) {
            alert(err.message);
        }
    }
});

customInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addBtn.click();
});
fixedInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addFixedBtn?.click();
});

// 최초 로딩
reloadAll().catch(() => {});
