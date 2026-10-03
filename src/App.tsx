import { useEffect, useState } from "react";
import {
  ADDRESS,
  ALCOHOL,
  DATES,
  ENTRY,
  FOODS,
  FORM_URL,
  MAP_URL,
  OTHER,
  TRANSPORT,
} from "./config";

type Stage = 'envelope' | 'form'
type Answers = {
  dates: string[];
  people: string;
  transport: string;
  transportOther: string;
  diet: string;
  foods: string[];
  foodsOther: string;
  alcohol: string;
};

const empty: Answers = {
  dates: [],
  people: "",
  transport: "",
  transportOther: "",
  diet: "",
  foods: [],
  foodsOther: "",
  alcohol: "",
};

const toggle = (list: string[], v: string) =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

async function submit(a: Answers) {
  const body = new URLSearchParams();
  a.dates.forEach((d) => body.append(ENTRY.dates, d));
  body.append(ENTRY.people, a.people);
  body.append(ENTRY.transport, a.transport);
  if (a.transport === OTHER)
    body.append(ENTRY.transportOther, a.transportOther.trim());
  body.append(ENTRY.diet, a.diet.trim());
  a.foods.forEach((f) => body.append(ENTRY.foods, f));
  if (a.foods.includes(OTHER))
    body.append(ENTRY.foodsOther, a.foodsOther.trim());
  body.append(ENTRY.alcohol, a.alcohol);
  // no-cors：瀏覽器無法讀取回應，因此只能假設送出成功
  await fetch(FORM_URL, { method: "POST", mode: "no-cors", body });
}

export default function App() {
  const [stage, setStage] = useState<Stage>("envelope");
  const [opened, setOpened] = useState(false) // 信封是否打開
  const [ready, setReady] = useState(false)   // 動畫跑完，可以點擊
  const [step, setStep] = useState(0); // 0 資訊頁, 1-6 題目, 7 感謝
  const [a, setA] = useState<Answers>(empty);
  const [sending, setSending] = useState(false);
  const set = (p: Partial<Answers>) => setA((prev) => ({ ...prev, ...p }));

useEffect(() => {
  const slow = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const t1 = setTimeout(() => setOpened(true), slow ? 500 : 0)
  const t2 = setTimeout(() => setReady(true), slow ? 2900 : 300)
  return () => { clearTimeout(t1); clearTimeout(t2) }
}, [])

  const valid = [
    true,
    a.dates.length > 0,
    Number(a.people) >= 1,
    a.transport !== "",
    a.diet.trim() !== "",
    a.foods.length > 0,
    a.alcohol !== "",
  ][step];

  const next = async () => {
    if (step === 6) {
      setSending(true);
      try {
        await submit(a);
      } catch {
        /* 忽略：no-cors 下錯誤無法判斷 */
      }
      setSending(false);
    }
    setStep(step + 1);
  };

  if (stage !== "form") {
    return (
      <main className="stage">
  <button
    className={`envelope ${opened ? 'open' : ''} ${ready ? 'ready' : ''}`}
    onClick={() => ready && setStage('form')}
    aria-label="點擊進入填寫"
    aria-disabled={!ready}
  >
    <span className="env-back" />
    <span className="paper">
      <b>烤肉邀請</b>
      <span>想找你一起<br />吃肉、聊天、耍廢</span>
    </span>
    <span className="env-front" />
    <span className="flap" />
  </button>
  <p className={`hint ${ready ? '' : 'gone'}`}>點擊進入填寫</p>
</main>
    );
  }

  return (
    <main className="stage form-in">
      <section className="card" key={step}>
        {step === 0 && (
          <>
            <h1>烤肉地點與接駁</h1>
            <p className="label">地址</p>
            <p>{ADDRESS}</p>
            <a className="link" href={MAP_URL} target="_blank" rel="noreferrer">
              在 Google 地圖開啟
            </a>
            <p className="label">接駁資訊</p>
            <p>台北捷運：丹鳳捷運站 1 號出口</p>
            <p>機場捷運：泰山貴和站</p>
          </>
        )}
        {step === 1 && (
          <Q title="Q1 以下哪些日期可以參加？（可複選）">
            {DATES.map((d) => (
              <Opt
                key={d}
                type="checkbox"
                checked={a.dates.includes(d)}
                onChange={() => set({ dates: toggle(a.dates, d) })}
              >
                {d}
              </Opt>
            ))}
          </Q>
        )}
        {step === 2 && (
          <Q title="Q2 總共會有幾位參加？">
            <label className="inline">
              <input
                className="text num"
                type="number"
                min={1}
                inputMode="numeric"
                value={a.people}
                onChange={(e) => set({ people: e.target.value })}
              />
              <span>人</span>
            </label>
          </Q>
        )}
        {step === 3 && (
          <Q title="Q3 預計如何前往？（單選）">
            {[...TRANSPORT, OTHER].map((t) => (
              <Opt
                key={t}
                type="radio"
                name="t"
                checked={a.transport === t}
                onChange={() => set({ transport: t })}
              >
                {t}
              </Opt>
            ))}
            {a.transport === OTHER && (
              <input
                className="text"
                placeholder="請填寫交通方式"
                value={a.transportOther}
                onChange={(e) => set({ transportOther: e.target.value })}
              />
            )}
          </Q>
        )}
        {step === 4 && (
          <Q title="Q4 有沒有過敏、飲食禁忌或不吃的食物？（沒有請填「無」）">
            <input
              className="text"
              value={a.diet}
              onChange={(e) => set({ diet: e.target.value })}
            />
          </Q>
        )}
        {step === 5 && (
          <Q title="Q5 有沒有特別想吃的烤肉食材？（可複選）">
            {[...FOODS, OTHER].map((f) => (
              <Opt
                key={f}
                type="checkbox"
                checked={a.foods.includes(f)}
                onChange={() => set({ foods: toggle(a.foods, f) })}
              >
                {f}
              </Opt>
            ))}
            {a.foods.includes(OTHER) && (
              <input
                className="text"
                placeholder="想吃什麼呢？"
                value={a.foodsOther}
                onChange={(e) => set({ foodsOther: e.target.value })}
              />
            )}
          </Q>
        )}
        {step === 6 && (
          <Q title="Q6 酒精飲料需求？">
            {ALCOHOL.map((v) => (
              <Opt
                key={v}
                type="radio"
                name="al"
                checked={a.alcohol === v}
                onChange={() => set({ alcohol: v })}
              >
                {v}
              </Opt>
            ))}
          </Q>
        )}
        {step === 7 && (
          <div className="thanks">
            <h1>感謝你完成填寫！🔥</h1>
            <p>等大家的時間都收集完畢後，我們會再公布最終的烤肉日期與地點～</p>
            <p>接下來就請空出肚子，準備一起吃肉、聊天、耍廢吧！🥩🍻✨</p>
            <p>期待烤肉見！🙌</p>
          </div>
        )}
        {step < 7 && (
          <div className="actions">
            {step > 0 && (
              <button
                className="btn ghost"
                disabled={sending}
                onClick={() => setStep(step - 1)}
              >
                上一題
              </button>
            )}
            <button className="btn" disabled={!valid || sending} onClick={next}>
              {step === 6 ? "完成填寫" : "下一題"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function Q({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="q">
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}

function Opt(p: {
  type: "checkbox" | "radio";
  name?: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className={`opt ${p.checked ? "on" : ""}`}>
      <input
        type={p.type}
        name={p.name}
        checked={p.checked}
        onChange={p.onChange}
      />
      <span>{p.children}</span>
    </label>
  );
}
