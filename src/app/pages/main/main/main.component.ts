import { Component, OnInit, EventEmitter, ElementRef } from "@angular/core";
import { BehaviorSubject, fromEvent, interval, of, timer } from "rxjs";
import { delay, tap, concatMap, repeat, takeUntil, take } from "rxjs/operators";
import Papa from "papaparse";
import encoding from "encoding-japanese";
import { ThrowStmt } from "@angular/compiler";

interface Trial {
  count: number;
  mode: number;
  displayLetter1: string;
  displayLetter2: string;
  answer: string;
  trueAnswer: string;
  time: number;
}

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"],
})
export class MainComponent implements OnInit {
  mode = 1;
  moji1$ = new BehaviorSubject<string>("");
  moji2$ = new BehaviorSubject<string>("");
  moji1SizeRate$ = new BehaviorSubject<number>(50);
  moji2SizeRate$ = new BehaviorSubject<number>(50);
  inputKey$ = new BehaviorSubject<string>("");
  isPlaying = false;
  isFinished = false;
  onFinish$ = new EventEmitter<any>();
  onTimerStop$ = new EventEmitter<any>();
  count = 0;
  mode1Letters = ["a", ""];
  letters = [
    "a",
    "b",
    "d",
    "e",
    "f",
    "g",
    "h",
    "j",
    "k",
    "m",
    "A",
    "B",
    "D",
    "E",
    "F",
    "G",
    "H",
    "J",
    "K",
    "M",
  ];
  letters4 = [
    "a",
    "b",
    "d",
    "e",
    "f",
    "g",
    "h",
    "j",
    "k",
    "m",
    "A",
    "B",
    "D",
    "E",
    "F",
    "G",
    "H",
    "J",
    "K",
    "M",
    "!",
    "#",
    "$",
    "%",
    "&",
  ];
  passingTime = 0;
  trials: Trial[] = [];
  private sound: HTMLAudioElement = new Audio("assets/sounds/sound.mp3");

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.sound.load();
  }
  start() {
    this.isPlaying = true;
    let decideLetter = () => {};
    let record = (e: KeyboardEvent) => {};
    let trueAnswer: string;
    if (this.mode === 1) {
      decideLetter = () => {
        this.count++;
        trueAnswer = "y";
        this.moji1$.next(this.mode1Letters[0]);
        console.log("display:", this.moji1$.getValue());
        this.startCounter();
      };
      record = (e: KeyboardEvent) => {
        this.stopCounter();
        console.log(this.passingTime);
        this.trials.push({
          count: this.count,
          mode: this.mode,
          displayLetter1: this.moji1$.getValue(),
          displayLetter2: "",
          answer: e.key,
          trueAnswer,
          time: this.passingTime,
        });
        this.moji1$.next("");
        console.log(this.trials);
      };
    } else if (this.mode === 2) {
      decideLetter = () => {
        this.count++;
        // 同じ文字
        if (this.randomInt(2) === 0) {
          trueAnswer = "y";
          const letterIdx = this.randomInt(20);
          if (letterIdx < 10) {
            this.moji1SizeRate$.next((Math.random() * 0.5 + 1) * 50);
            this.moji2SizeRate$.next((Math.random() * 0.5 + 1) * 50);
          } else {
            this.moji1SizeRate$.next((Math.random() * 0.33 + 0.67) * 50);
            this.moji2SizeRate$.next((Math.random() * 0.33 + 0.66) * 50);
          }
          const letter = this.letters[letterIdx];
          console.log("same", letter);

          this.moji1$.next(letter);
          this.moji2$.next(letter);
          console.log("display:", this.moji1$.getValue());
        } else {
          trueAnswer = "n";
          const letter1Idx = this.randomInt(20);
          let letter2Idx = this.randomInt(19);
          if (letter1Idx <= letter2Idx) {
            letter2Idx++;
          }
          letter1Idx < 10
            ? this.moji1SizeRate$.next((Math.random() * 0.5 + 1) * 50)
            : this.moji1SizeRate$.next((Math.random() * 0.33 + 0.67) * 50);
          letter2Idx < 10
            ? this.moji2SizeRate$.next((Math.random() * 0.5 + 1) * 50)
            : this.moji2SizeRate$.next((Math.random() * 0.33 + 0.67) * 50);

          this.moji1$.next(this.letters[letter1Idx]);
          this.moji2$.next(this.letters[letter2Idx]);
        }
        console.log("display:", this.moji1$.getValue());
        this.startCounter();
      };
      record = (e: KeyboardEvent) => {
        this.stopCounter();
        console.log(this.passingTime);
        this.trials.push({
          count: this.count,
          mode: this.mode,
          displayLetter1: this.moji1$.getValue(),
          displayLetter2: this.moji2$.getValue(),
          answer: e.key,
          trueAnswer,
          time: this.passingTime,
        });
        this.moji1$.next("");
        this.moji2$.next("");
        console.log(this.trials);
      };
    } else if (this.mode === 3) {
      decideLetter = () => {
        this.count++;
        // 同じ文字
        if (this.randomInt(2) === 0) {
          trueAnswer = "y";
          const letter1Idx = this.randomInt(20);
          const coreNum = letter1Idx % 10;
          const letter2Idx = coreNum + 10 * this.randomInt(2);
          letter1Idx < 10
            ? this.moji1SizeRate$.next((Math.random() * 0.5 + 1) * 50)
            : this.moji1SizeRate$.next((Math.random() * 0.33 + 0.67) * 50);
          letter2Idx < 10
            ? this.moji2SizeRate$.next((Math.random() * 0.5 + 1) * 50)
            : this.moji2SizeRate$.next((Math.random() * 0.33 + 0.67) * 50);

          this.moji1$.next(this.letters[letter1Idx]);
          this.moji2$.next(this.letters[letter2Idx]);
          console.log("display:", this.moji1$.getValue());
        } else {
          trueAnswer = "n";
          const letter1Idx = this.randomInt(20);
          let letter2Idx;
          do {
            letter2Idx = this.randomInt(20);
          } while (letter1Idx % 10 === letter2Idx % 10);
          letter1Idx < 10
            ? this.moji1SizeRate$.next((Math.random() * 0.5 + 1) * 50)
            : this.moji1SizeRate$.next((Math.random() * 0.33 + 0.67) * 50);
          letter2Idx < 10
            ? this.moji2SizeRate$.next((Math.random() * 0.5 + 1) * 50)
            : this.moji2SizeRate$.next((Math.random() * 0.33 + 0.67) * 50);
          this.moji1$.next(this.letters[letter1Idx]);
          this.moji2$.next(this.letters[letter2Idx]);
        }
        console.log(
          `moji1:${this.moji1$.getValue()} moji2:${this.moji2$.getValue()}`
        );
        this.startCounter();
      };
      record = (e: KeyboardEvent) => {
        this.stopCounter();
        console.log(this.passingTime);
        this.trials.push({
          count: this.count,
          mode: this.mode,
          displayLetter1: this.moji1$.getValue(),
          displayLetter2: this.moji2$.getValue(),
          answer: e.key,
          trueAnswer,
          time: this.passingTime,
        });
        this.moji1$.next("");
        this.moji2$.next("");
        console.log(this.trials);
      };
    } else if (this.mode === 4) {
      decideLetter = () => {
        this.count++;
        // 同じカテゴリ
        if (this.randomInt(2) === 0) {
          trueAnswer = "y";
          const category = this.randomInt(3);
          let letter1Idx;
          let letter2Idx;
          if (category === 0) {
            letter1Idx = this.randomInt(10);
            letter2Idx = this.randomInt(10);

            this.moji1SizeRate$.next((Math.random() * 0.5 + 1) * 50);
            this.moji2SizeRate$.next((Math.random() * 0.5 + 1) * 50);
          } else if (category === 1) {
            letter1Idx = this.randomInt(10) + 10;
            letter2Idx = this.randomInt(10) + 10;
            this.moji1SizeRate$.next((Math.random() * 0.5 + 0.5) * 50);
            this.moji2SizeRate$.next((Math.random() * 0.5 + 0.5) * 50);
          } else {
            letter1Idx = this.randomInt(5) + 20;
            letter2Idx = this.randomInt(5) + 20;
            this.moji1SizeRate$.next((Math.random() * 0.5 + 0.5) * 50);
            this.moji2SizeRate$.next((Math.random() * 0.5 + 0.5) * 50);
          }
          this.moji1$.next(this.letters4[letter1Idx]);
          this.moji2$.next(this.letters4[letter2Idx]);
        } else {
          trueAnswer = "n";
          const category1 = this.randomInt(3);
          let category2;
          do {
            category2 = this.randomInt(3);
          } while (category1 === category2);
          const letter1Idx =
            category1 === 2
              ? this.randomInt(5)
              : this.randomInt(10) + category1 * 10;
          const letter2Idx =
            category2 === 2
              ? this.randomInt(5)
              : this.randomInt(10) + category2 * 10;
          letter1Idx < 10
            ? this.moji1SizeRate$.next((Math.random() * 0.5 + 1) * 50)
            : this.moji1SizeRate$.next((Math.random() * 0.5 + 0.5) * 50);
          letter2Idx < 10
            ? this.moji2SizeRate$.next((Math.random() * 0.5 + 1) * 50)
            : this.moji2SizeRate$.next((Math.random() * 0.5 + 0.5) * 50);
          this.moji1$.next(this.letters4[letter1Idx]);
          this.moji2$.next(this.letters4[letter2Idx]);
        }
        console.log(
          `moji1:${this.moji1$.getValue()} moji2:${this.moji2$.getValue()}`
        );
        this.startCounter();
      };
      record = (e: KeyboardEvent) => {
        this.stopCounter();
        console.log(this.passingTime);
        this.trials.push({
          count: this.count,
          mode: this.mode,
          displayLetter1: this.moji1$.getValue(),
          displayLetter2: this.moji2$.getValue(),
          answer: e.key,
          trueAnswer,
          time: this.passingTime,
        });
        this.moji1$.next("");
        this.moji2$.next("");
        console.log(this.trials);
      };
    } else {
      this.isPlaying = false;
      this.isFinished = true;
      return;
    }
    of(null)
      .pipe(
        delay(1000),
        // tap(() => this.sound.play()),
        concatMap(() => timer(1000 + Math.random() * 5000)),
        tap(decideLetter),
        // タイム計測開始
        concatMap(() => fromEvent(document, "keydown")),
        // タイム計測終了
        tap(record),
        take(1),
        repeat(10)
      )
      .subscribe(
        (_) => {},
        (_) => {},
        () => {
          this.isPlaying = false;
          this.mode += 1;
          if (this.mode > 4) {
            this.isFinished = true;
          }
        }
      );
  }
  startCounter() {
    interval(1)
      .pipe(takeUntil(this.onTimerStop$))
      .subscribe((t) => (this.passingTime = t));
  }
  stopCounter() {
    this.onTimerStop$.emit();
  }
  exportCSV() {
    // configの初期値
    const config = {
      delimiter: ",", // 区切り文字
      header: true, // キーをヘッダーとして扱う
      newline: "\r\n", // 改行
    };

    // 区切り文字へ変換
    const delimiterString = Papa.unparse(this.trials, config);

    // blobUrlへの変換
    const strArray = encoding.stringToCode(delimiterString);
    const convertedArray = encoding.convert(strArray, "SJIS", "UNICODE");
    const UintArray = new Uint8Array(convertedArray);
    const blobUrl = new Blob([UintArray], { type: "text/csv" });
    const blob = blobUrl;
    const url = window.URL.createObjectURL(blob);

    const link: HTMLAnchorElement = this.elementRef.nativeElement.querySelector(
      "#csv-download"
    ) as HTMLAnchorElement;
    link.href = url;
    link.download = this.mode + ".csv";
    link.click();
  }
  // 0からn-1までの整数をランダムに出力
  randomInt(num: number) {
    return Math.floor(Math.random() * num);
  }
}
