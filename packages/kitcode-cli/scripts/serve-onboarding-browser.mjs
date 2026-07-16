import http from 'node:http';
import {renderOnboardingWindow} from '../src/onboarding-window.mjs';

const port = Number(process.env.KITCODE_ONBOARDING_TEST_PORT) || 4789;
const bridge = `<script>
  const testProjects = {
    first: {id: 'project-1', repoRoot: '/workspace/first-project', sourceType: 'git', active: true},
    second: {id: 'project-2', repoRoot: '/workspace/second-project', sourceType: 'vibe', active: true},
    third: {id: 'project-3', repoRoot: '/workspace/third-project', sourceType: 'git', active: true},
  };
  window.__testPickerCalls = 0;
  window.__testSubmissions = [];
  window.kitcodeOnboarding = {
    initialState: async () => ({completed: true, autoTrack: false, companionView: 'mini', projects: [testProjects.first]}),
    selectFolders: async () => {
      window.__testPickerCalls += 1;
      return window.__testPickerCalls === 1
        ? {canceled: false, projects: [testProjects.second]}
        : {canceled: false, projects: [testProjects.second, testProjects.third]};
    },
    submit: async (input) => {
      window.__testSubmissions.push(input);
      document.documentElement.dataset.lastSubmission = JSON.stringify(input);
      document.documentElement.dataset.submissionCount = String(window.__testSubmissions.length);
      return window.__testSubmissions.length === 1
        ? {ok: false, error: 'Projects were saved, but the tracker could not start.', projects: [testProjects.first, testProjects.third]}
        : {ok: true, projects: [testProjects.first, testProjects.third]};
    },
    close: async () => ({closed: true}),
  };
</script>`;
const html = renderOnboardingWindow(process.platform).replace('<script>', bridge + '<script>');
const server = http.createServer((_request, response) => {
  response.writeHead(200, {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store'});
  response.end(html);
});

server.listen(port, '127.0.0.1', () => console.log(`Onboarding browser fixture: http://127.0.0.1:${port}`));

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
