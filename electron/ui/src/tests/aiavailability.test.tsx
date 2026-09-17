import { act, fireEvent, render, screen } from '@testing-library/react';
import { AIPromptProvider, useAIPrompt } from '../context/AIPromptContext';
import {
  getAIAvailability,
  requestAIDataUpdate,
  requestAIOptimizationDiagnosis,
} from '../services/app.service';
import ModelResults from '../views/ModelResults/ModelResults';
import mockScenario from './data/mockScenario.json';
import type { Scenario } from '../types';

jest.mock('../AppContext', () => ({ useApp: () => ({ port: 50011 }) }));
jest.mock('../services/app.service', () => ({
  getAIAvailability: jest.fn(),
  requestAIDataUpdate: jest.fn(),
  requestAIOptimizationDiagnosis: jest.fn(),
}));
jest.mock('../views/ModelResults/SankeyPlot', () => () => null);
jest.mock('../views/ModelResults/KPIDashboard', () => () => null);
jest.mock('../components/NetworkDiagram/NetworkDiagram', () => () => null);
jest.mock('../components/WaterResiduals/WaterResiduals', () => () => null);

const availability = jest.fn();
const originalFetch = global.fetch;
const service = jest.requireActual('../services/app.service');
afterEach(() => {
  global.fetch = originalFetch;
  delete window.paretoAISettings;
});
const response = (available: boolean) =>
  ({ ok: true, json: async () => ({ available }) }) as Response;

function Requests() {
  const { isAvailable, status, runPrompt, runOptimizationDiagnosis } = useAIPrompt();
  return (
    <>
      <output>{`${isAvailable}:${status}`}</output>
      <button onClick={() => runPrompt(1, 'Fill inputs')}>Fill</button>
      <button onClick={() => runOptimizationDiagnosis(1, 'Infeasible')}>Diagnose</button>
    </>
  );
}

beforeEach(() => {
  jest.resetAllMocks();
  delete window.paretoAISettings;
  global.fetch = availability;
  (getAIAvailability as jest.Mock).mockImplementation(service.getAIAvailability);
});

test('AI stays unavailable while checking and requests are blocked when no key is configured', async () => {
  let resolve: (response: Response) => void;
  availability.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  render(
    <AIPromptProvider>
      <Requests />
    </AIPromptProvider>,
  );
  expect(screen.getByText('false:idle')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Diagnose'));
  await act(async () => {
    resolve(response(false));
  });
  fireEvent.click(screen.getByText('Fill'));
  expect(screen.getByText('false:idle')).toBeInTheDocument();
  expect(requestAIDataUpdate).not.toHaveBeenCalled();
  expect(requestAIOptimizationDiagnosis).not.toHaveBeenCalled();
});

test.each(['network', 'http', 'json'])(
  'a failed availability check (%s) quietly leaves AI hidden',
  async (failure) => {
    if (failure === 'network') availability.mockRejectedValue(new Error('Offline'));
    if (failure === 'http') availability.mockResolvedValue({ ok: false } as Response);
    if (failure === 'json')
      availability.mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as unknown as Response);
    await act(async () => {
      render(
        <AIPromptProvider>
          <Requests />
        </AIPromptProvider>,
      );
    });
    expect(screen.getByText('false:idle')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Diagnose'));
    expect(requestAIOptimizationDiagnosis).not.toHaveBeenCalled();
  },
);

test.each([
  [false, 'Infeasible'],
  [true, 'Infeasible'],
  [false, 'failure'],
  [true, 'failure'],
])('diagnosis UI requires availability (%s) for status %s', async (available, status) => {
  availability.mockResolvedValue(response(available as boolean));
  const scenario = {
    ...mockScenario,
    results: { status, data: {}, error: 'Run could not complete.' },
  } as unknown as Scenario;
  await act(async () => {
    render(
      <AIPromptProvider>
        <ModelResults
          scenario={scenario}
          category="Dashboard"
          handleSetSection={jest.fn()}
          updateScenario={jest.fn()}
        />
      </AIPromptProvider>,
    );
  });
  expect(screen.getByText('Run could not complete.')).toBeInTheDocument();
  expect(screen.getByText(/No evaluable constraint details/)).toBeInTheDocument();
  expect(Boolean(screen.queryByRole('button', { name: /Diagnose .* with AI/i }))).toBe(available);
  expect(Boolean(screen.queryByText(/Ask AI to review/))).toBe(available);
});

test('malformed availability stays hidden and the existing startup retry can recover', async () => {
  jest.useFakeTimers();
  try {
    availability
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ available: 'true' }) })
      .mockResolvedValue(response(true));
    const view = render(
      <AIPromptProvider>
        <Requests />
      </AIPromptProvider>,
    );
    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    expect(screen.getByText('false:idle')).toBeInTheDocument();
    expect(availability).toHaveBeenCalledTimes(1);
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.getByText('true:idle')).toBeInTheDocument();
    expect(availability).toHaveBeenCalledTimes(2);
    view.unmount();
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(availability).toHaveBeenCalledTimes(2);
  } finally {
    jest.useRealTimers();
  }
});
