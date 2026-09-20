import { testingService } from '../services/testing.service.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Execute the full platform integration test suite
 */
export const runTestSuite = async (req, res, next) => {
  try {
    const workspaceId = req.workspace?._id || req.user?.workspaceId;
    const results = await testingService.runFullIntegrationSuite(workspaceId, req.user);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Execute synthetic end-to-end scenario simulations
 */
export const runScenario = async (req, res, next) => {
  try {
    const { scenarioType = 'client_billing_lifecycle' } = req.body;
    const workspaceId = req.workspace?._id || req.user?.workspaceId;
    const scenario = await testingService.runScenarioSimulation(scenarioType, workspaceId, req.user);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: scenario,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch live performance and concurrency benchmark metrics
 */
export const runBenchmarks = async (req, res, next) => {
  try {
    const workspaceId = req.workspace?._id || req.user?.workspaceId;
    const benchmarks = await testingService.runPerformanceBenchmarks(workspaceId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: benchmarks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export verified test certification report in JSON or Markdown format
 */
export const exportTestReport = async (req, res, next) => {
  try {
    const { format = 'json', testResults } = req.body;
    const report = testingService.generateCertificationReport(testResults, format);

    if (format === 'markdown') {
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename="veyora-verification-certificate.md"');
      return res.send(report);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
