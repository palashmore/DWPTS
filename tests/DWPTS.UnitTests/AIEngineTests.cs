using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;
using DWPTS.Application.DTOs;
using DWPTS.Application.Features.AI;

namespace DWPTS.UnitTests;

public class AIEngineTests
{
    private readonly AIEngineService _aiService = new();

    [Fact]
    public async Task ClassifyTaskAsync_BugDescription_ReturnsBugFixCategoryAndHighPriority()
    {
        // Act
        var result = await _aiService.ClassifyTaskAsync("Fix slow API response and database crash in customer portal");

        // Assert
        Assert.Equal("Bug Fix", result.Category);
        Assert.Equal("High", result.Priority);
        Assert.True(result.Confidence > 0.85m);
    }

    [Fact]
    public async Task ParsePlanNotesAsync_NaturalLanguage_ReturnsStructuredDraftEntries()
    {
        // Act
        var notes = "Tomorrow I need to test payment gateway; attend sprint sync meeting; refactor database index";
        var drafts = await _aiService.ParsePlanNotesAsync(notes);

        // Assert
        Assert.True(drafts.Count >= 3);
        Assert.Contains(drafts, d => d.Category == "Discussion");
        Assert.Contains(drafts, d => d.WorkHours > 0);
    }

    [Fact]
    public async Task EstimateEffortAsync_HighComplexity_ReturnsRealisticEstimationRange()
    {
        // Arrange
        var req = new AIEstimateRequest("Complete database migration and architecture refactoring", "Development", "High");

        // Act
        var result = await _aiService.EstimateEffortAsync(req);

        // Assert
        Assert.True(result.EstimatedHours >= 7.0m);
        Assert.True(result.MinHours < result.EstimatedHours);
        Assert.True(result.MaxHours > result.EstimatedHours);
        Assert.True(result.SimilarHistoricalTasksCount > 0);
    }

    [Fact]
    public async Task AskDwptsAsync_OvertimeQuery_ReturnsAuthorizedOvertimeAudit()
    {
        // Act
        var result = await _aiService.AskDwptsAsync("Who worked more than 40 hours last week?", "ADMIN", "admin");

        // Assert
        Assert.Equal("OvertimeAudit", result.Intent);
        Assert.True(result.IsAuthorized);
        Assert.True(result.Insights.Count > 0);
    }

    [Fact]
    public async Task QueryKnowledgeBaseAsync_CapacityQuestion_ReturnsGroundedAnswerWithCitation()
    {
        // Act
        var result = await _aiService.QueryKnowledgeBaseAsync("What is the capacity overload policy?");

        // Assert
        Assert.Contains("95%", result.GroundedAnswer);
        Assert.Equal("Capacity Management & Overload Policy", result.SourceDocument);
        Assert.Equal("Section 4.3: Capacity Risk Thresholds", result.SourceSection);
        Assert.True(result.ConfidenceScore > 0.85m);
        Assert.True(result.HasDirectSource);
    }
}
